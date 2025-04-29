from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import Student
from details.models import Submissions
from .utils import IsSupervisor
from .models import Document, Feedback, Logbook, StudentSubmission
from .serializers import (
    CombinedSubmissionSerializer,
    DocumentSerializer,
    LogbookCallSerializer,
    LogbookSerializer,
    MarkingSchemeSerializer,
    StudentAllSubmissionSerializer,
    StudentSubmissionSerializer,
    FeedbackSerializer,
    SubmissionUploadSerializer,
)
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.http import HttpResponse
from django.template.loader import render_to_string
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    PageBreak,
    Frame,
    PageTemplate,
    BaseDocTemplate,
    Table,
    TableStyle,
    Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime
import os
from django.conf import settings
import html.parser
from django.core.mail import send_mail


class DocumentListView(APIView):
    def get(self, request, title=None):
        if title:
            document = get_object_or_404(
                Document, category__label="Marking Scheme", title=title
            )
            serializer = MarkingSchemeSerializer(document, context={"request": request})
        else:
            documents = Document.objects.select_related("category", "mode").all()
            serializer = DocumentSerializer(
                documents, many=True, context={"request": request}
            )
        return Response(serializer.data)


class StudentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        url_name = request.resolver_match.url_name
        print("Request path:", request.path)

        if url_name == "all-student-submissions":
            student = get_object_or_404(Student, id=student_id)
            if request.user.role not in [
                "supervisor",
                "examiner",
                "course_coordinator",
            ]:
                return Response({"detail": "Unauthorized"}, status=403)

            submissions = StudentSubmission.objects.filter(student=student)

            serializer = StudentAllSubmissionSerializer(
                submissions, many=True, context={"request": request}
            )
            return Response(serializer.data)

        if url_name == "all-student-submissions-ids":
            student = get_object_or_404(Student, id=student_id)
            if request.user.role not in [
                "supervisor",
                "examiner",
                "course_coordinator",
            ]:
                return Response({"detail": "Unauthorized"}, status=403)

            submissions = StudentSubmission.objects.filter(student=student)
            data = [
                {
                    "id": submission.id,
                    "name": submission.submission_phase.title,
                }
                for submission in submissions
            ]
            return Response(data)

        if request.user.role != "student" and request.user.id != student_id:
            return Response({"detail": "Unauthorized"}, status=403)

        student = get_object_or_404(Student, user_id=student_id)

        submission_phases = Submissions.objects.all().order_by(
            "date_open",
            "date_close",
        )

        student_course = request.user.student.course
        submission_phases = submission_phases.filter(
            course__in=[student_course, "Both"]
        )

        serializer = CombinedSubmissionSerializer(
            submission_phases,
            many=True,
            context={"request": request, "student": request.user.student},
        )
        return Response(serializer.data)


class LatestStudentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        if request.user.role == "student":
            return Response({"detail": "Unauthorized"}, status=403)
        submission = (
            StudentSubmission.objects.filter(student__id=student_id)
            .order_by("-upload_date")
            .first()
        )
        if submission:
            serializer = StudentSubmissionSerializer(
                submission, context={"request": request}
            )
            return Response(serializer.data)
        return Response({}, status=404)


class SpecificStudentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id, studentsubmission_id):
        if request.user.role == "student":
            return Response({"detail": "Unauthorized"}, status=403)

        student = get_object_or_404(Student, id=student_id)

        submission = get_object_or_404(
            StudentSubmission, id=studentsubmission_id, student=student
        )

        serializer = StudentSubmissionSerializer(
            submission, context={"request": request}
        )
        return Response(serializer.data)


class FeedbackUploadView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def post(self, request, student_id):
        submission_id = request.data.get("submission")
        file = request.FILES.get("file")  # May be None
        comment = request.data.get("comment", "")

        if not submission_id:
            return Response({"detail": "Missing submission."}, status=400)

        try:
            submission = StudentSubmission.objects.get(
                id=submission_id, student__id=student_id
            )
        except StudentSubmission.DoesNotExist:
            return Response({"detail": "Student submission not found."}, status=404)

        feedback, created = Feedback.objects.get_or_create(
            submission=submission,
            supervisor=request.user,
            defaults={"file": file, "comment": comment},
        )

        if not created:
            if file:
                feedback.file = file
            feedback.comment = comment
            feedback.save()

        serializer = FeedbackSerializer(feedback, context={"request": request})

        try:
            email = submission.student.user.email
            if email:
                subject = "Submission Feedback"
                message = (
                    f"Hi {submission.student.user.name},\n\n"
                    f"You have received a feedback for your submission {submission.submission_phase.title}.\n\n"
                    f"Best regards,\n"
                    f"POSSE"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
            else:
                print("No email found for student")
        except Exception as email_error:
            print("Error sending email:", email_error)
        return Response(serializer.data, status=201 if created else 200)


class DeleteFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, feedback_id):
        if request.user.role not in ["supervisor", "examiner", "course_coordinator"]:
            return Response({"detail": "Unauthorized"}, status=403)

        try:
            target = Feedback.objects.get(id=feedback_id)
            target.file.delete(save=False)
            target.delete()
            return Response({"detail": "Feedback deleted successfully"}, status=200)
        except Feedback.DoesNotExist:
            return Response(
                {"detail": "Submission not found" + str(feedback_id)},
                status=404,
            )


class UploadStudentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, student_id):
        if request.user.role != "student" or request.user.id != student_id:
            return Response({"detail": "Unauthorized"}, status=403)

        serializer = SubmissionUploadSerializer(
            data=request.data, context={"student": request.user.student}
        )

        if serializer.is_valid():
            submission = serializer.save()
            return Response(
                {"detail": "Submission uploaded", "id": submission.id}, status=201
            )
        return Response(serializer.errors, status=400)


class DeleteSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, student_id, studentsubmission_id):
        if request.user.role != "student" or request.user.id != student_id:
            return Response({"detail": "Unauthorized"}, status=403)

        try:
            submission = StudentSubmission.objects.get(id=studentsubmission_id)
            submission.file.delete(save=False)
            submission.delete()
            return Response({"detail": "Submission deleted successfully"}, status=200)
        except StudentSubmission.DoesNotExist:
            return Response(
                {"detail": "Submission not found" + str(studentsubmission_id)},
                status=404,
            )


class LogbookCreateUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()

        # Validate user role and required fields
        if request.user.role in ["supervisor", "course_coordinator"]:
            if not data.get("student") or not data.get("supervisor"):
                return Response(
                    {"detail": "Student and supervisor IDs are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Ensure supervisor is authorized to create log for this student
            student = get_object_or_404(Student, id=data["student"])
            if request.user.role == "supervisor" and student.supervisor != request.user:
                return Response(
                    {"detail": "Not authorized to create logbook for this student."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role == "student":
            student = get_object_or_404(Student, user=request.user)
            data["student"] = student.id
            data["supervisor"] = student.supervisor.id if student.supervisor else None
            if not data["supervisor"]:
                return Response(
                    {"detail": "No supervisor assigned to this student."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"detail": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = LogbookSerializer(data=data)
        if serializer.is_valid():
            logbook = serializer.save()
            return Response(
                LogbookSerializer(logbook).data, status=status.HTTP_201_CREATED
            )
        return Response(
            {"detail": "Invalid data.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk):
        log = get_object_or_404(Logbook, id=pk)

        if request.user.role == "student":
            if log.student.user != request.user:
                return Response(
                    {"detail": "Not authorized to update this logbook."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role in ["supervisor", "course_coordinator"]:
            if request.user.role == "supervisor" and log.supervisor != request.user:
                return Response(
                    {"detail": "Not authorized to update this logbook."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            return Response(
                {"detail": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = LogbookSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            updated_log = serializer.save()
            return Response(
                LogbookSerializer(updated_log).data, status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Invalid data.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        log = get_object_or_404(Logbook, id=pk)

        # Permission checks
        if request.user.role == "student":
            if log.student.user != request.user:
                return Response(
                    {"detail": "Not authorized to delete this logbook."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role in ["supervisor", "course_coordinator"]:
            if request.user.role == "supervisor" and log.supervisor != request.user:
                return Response(
                    {"detail": "Not authorized to delete this logbook."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            return Response(
                {"detail": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN
            )

        log.delete()
        return Response(
            {"detail": "Logbook deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class LogbookStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role not in ["supervisor", "course_coordinator"]:
            return Response(
                {"detail": "Not authorized to update logbook status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        log = get_object_or_404(Logbook, id=pk)

        if request.user.role == "supervisor" and log.supervisor != request.user:
            return Response(
                {"detail": "Not authorized to update this logbook's status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        status_value = request.data.get("status")
        if status_value not in dict(Logbook.CATEGORY_CHOICES):
            return Response(
                {
                    "detail": f"Invalid status. Must be one of: {', '.join(dict(Logbook.CATEGORY_CHOICES).keys())}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_fields = ["status"]
        log.status = status_value

        comment = request.data.get("comment")
        if comment is not None:
            if not isinstance(comment, str):
                return Response(
                    {"detail": "Comment must be a string."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            log.comment = comment
            update_fields.append("comment")

        log.save(update_fields=update_fields)

        if log.status == "approved":
            try:
                email = log.student.user.email
                if email:
                    subject = "Submission Feedback"
                    message = (
                        f"Hi {log.student.user.name},\n\n"
                        f"Your logbook for {log.date} has been approved.\n\n"
                        f"Best regards,\n"
                        f"POSSE"
                    )
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                else:
                    print("No email found for student")
            except Exception as email_error:
                print("Error sending email:", email_error)

        return Response(
            {
                "detail": "Status updated successfully.",
                "status": log.status,
                "comment": log.comment,
            },
            status=status.HTTP_200_OK,
        )


class LogbookListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        if request.user.role == "student":
            student = get_object_or_404(Student, user__id=student_id)

            if request.user != student.user:
                return Response(
                    {"detail": "Not authorized to view these logbooks."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role == "supervisor":
            student = get_object_or_404(Student, id=student_id)

            if student.supervisor != request.user:
                return Response(
                    {"detail": "Not authorized to view these logbooks."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role != "course_coordinator":
            return Response(
                {"detail": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN
            )

        logbooks = Logbook.objects.filter(student=student).order_by("-date")

        if request.path.endswith("calendar/"):
            serializer = LogbookCallSerializer(logbooks, many=True)

        serializer = LogbookSerializer(logbooks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HTMLToReportLabParser(html.parser.HTMLParser):
    def __init__(self, styles):
        super().__init__()
        self.styles = styles
        self.flowables = []
        self.current_text = []
        self.current_style = "Normal"
        self.current_table = None
        self.current_row = None
        self.in_table = False
        self.in_header = False
        self.header_text = []
        self.style_stack = []  # To handle nested styles

    def handle_starttag(self, tag, attrs):
        # Push current style to stack to preserve for nested tags
        self.style_stack.append(self.current_style)

        if tag == "h1":
            self.current_style = "CustomTitle"
        elif tag == "p":
            self.current_style = "CustomBody"
            for attr in attrs:
                if attr[0] == "class" and attr[1] == "section-title":
                    self.current_style = "SectionTitle"
                elif attr[0] == "class" and attr[1] == "underline":
                    self.current_style = "DottedUnderline"
        elif tag == "span":
            for attr in attrs:
                if attr[0] == "class" and attr[1] == "field-label":
                    self.current_style = "CustomBold"
                elif attr[0] == "class" and attr[1] == "dotted":
                    self.current_style = "Dotted"
                elif attr[0] == "class" and attr[1] == "dotted-content":
                    self.current_style = "DottedContent"
        elif tag == "li":
            self.current_style = "CustomBody"
            self.current_text.append("• ")  # Use bullet instead of hyphen
        elif tag == "table":
            self.in_table = True
            self.current_table = []
        elif tag == "tr":
            self.current_row = []
        elif tag == "td":
            self.current_text = []
        elif tag == "div":
            for attr in attrs:
                if attr[0] == "class" and attr[1] == "header":
                    self.in_header = True
                    self.header_text = []
                elif attr[0] == "class" and attr[1] == "page-break":
                    self.flowables.append(PageBreak())
        elif tag == "img":
            src = None
            for attr in attrs:
                if attr[0] == "src":
                    src = attr[1]
                    break
            if src:
                try:
                    img_path = os.path.join(
                        settings.STATIC_ROOT, src.replace("/static/", "")
                    )
                    if os.path.exists(img_path):
                        self.flowables.append(Image(img_path, width=80, height=32))
                except Exception as e:
                    print(f"Error loading image: {e}")

    def handle_endtag(self, tag):
        if tag in ("h1", "p", "span", "li"):
            if self.current_text:
                text = "".join(self.current_text).strip()
                if text:
                    self.flowables.append(
                        Paragraph(text, self.styles[self.current_style])
                    )
                self.current_text = []
            # Pop style from stack instead of resetting to "Normal"
            self.current_style = (
                self.style_stack.pop() if self.style_stack else "Normal"
            )
        elif tag == "td":
            text = "".join(self.current_text).strip()
            # Wrap text in Paragraph for better control within table cells
            self.current_row.append(Paragraph(text, self.styles[self.current_style]))
            self.current_text = []
        elif tag == "tr":
            self.current_table.append(self.current_row)
            self.current_row = []
        elif tag == "table":
            self.in_table = False
            # Dynamic column widths based on page size
            table = Table(self.current_table, colWidths=[2.5 * inch, 4.5 * inch])
            table.setStyle(
                TableStyle(
                    [
                        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.black),
                        ("FONTSIZE", (0, 0), (-1, -1), 11),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                        ("FONTNAME", (0, 0), (-1, -1), "Times-Roman"),
                        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ]
                )
            )
            self.flowables.append(table)
        elif tag == "div" and self.in_header:
            self.in_header = False
            header_text = "".join(self.header_text).strip()
            if header_text:
                self.flowables.append(Paragraph(header_text, self.styles["HeaderText"]))
        # Ensure style is restored from stack
        self.current_style = self.style_stack.pop() if self.style_stack else "Normal"

    def handle_data(self, data):
        if self.in_header:
            self.header_text.append(data)
        else:
            self.current_text.append(data)


@csrf_exempt
def export_logs_pdf(request, student_id):
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="logs_export.pdf"'

    default_font = "Times-Roman"
    default_font_bold = "Times-Bold"

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CustomTitle",
            fontName=default_font_bold,
            fontSize=18,
            leading=22,
            spaceAfter=16,
            spaceBefore=20,
            alignment=1,  # Center
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            fontName=default_font_bold,
            fontSize=14,
            leading=18,
            spaceAfter=12,
            spaceBefore=12,
            alignment=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CustomBody",
            fontName=default_font,
            fontSize=12,
            leading=16,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CustomBold",
            fontName=default_font_bold,
            fontSize=12,
            leading=16,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DottedUnderline",
            fontName=default_font,
            fontSize=12,
            leading=16,
            spaceAfter=10,
            alignment=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Dotted",
            fontName=default_font,
            fontSize=12,
            leading=16,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DottedContent",
            fontName=default_font,
            fontSize=12,
            leading=16,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HeaderText",
            fontName=default_font_bold,
            fontSize=12,
            leading=14,
            spaceAfter=8,
            alignment=1,
        )
    )

    try:
        student = (
            Student.objects.get(user__id=student_id)
            if Student.objects.filter(user__id=student_id).exists()
            else Student.objects.get(student_id=student_id)
        )
    except Student.DoesNotExist:
        return HttpResponse("Student not found.", status=404)

    logs = Logbook.objects.filter(student=student).order_by("date")
    if not logs.exists():
        return HttpResponse("No logs available for export.", status=404)

    context = {
        "logs": logs,
        "project_title": student.topic or "No topic assigned",
        "student_name": student.user.name,
        "student_id": student.student_id,
        "student_email": student.user.email,
        "student_mobile": "N/A",
        "student_department": "IS / SE / CS",
        "supervisor_name": student.supervisor.name if student.supervisor else "N/A",
        "supervisor_email": student.supervisor.email if student.supervisor else "N/A",
        "generate_date": datetime.now(),
    }

    html_content = render_to_string("logbooks.html", context)
    parser = HTMLToReportLabParser(styles)
    parser.feed(html_content)
    story = parser.flowables

    class CustomDocTemplate(BaseDocTemplate):
        def __init__(self, filename, **kwargs):
            super().__init__(filename, **kwargs)
            self.addPageTemplates(self._create_page_template())

        def _create_page_template(self):
            frame = Frame(
                0.75 * inch,
                0.75 * inch,
                letter[0] - 1.5 * inch,
                letter[1] - 1.5 * inch,
                id="normal",
            )
            return PageTemplate(id="custom", frames=[frame])

    doc = CustomDocTemplate(response, pagesize=letter)
    doc.build(story)
    return response
