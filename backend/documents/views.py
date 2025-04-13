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
    LogbookSerializer,
    MarkingSchemeSerializer,
    StudentAllSubmissionSerializer,
    StudentSubmissionSerializer,
    FeedbackSerializer,
    SubmissionUploadSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status


class DocumentListView(APIView):
    def get(self, request, title=None):
        if "scheme" in request.path:
            document = get_object_or_404(
                Document, category="Marking Scheme", title=title
            )
            serializer = MarkingSchemeSerializer(document, context={"request": request})

        else:
            documents = Document.objects.all()

            serializer = DocumentSerializer(
                documents, many=True, context={"request": request}
            )
        return Response(serializer.data)


class StudentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        student = get_object_or_404(Student, user__id=student_id)

        if request.path.endswith("all/"):
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

        if request.user.role != "student" and request.user.id != student_id:
            return Response({"detail": "Unauthorized"}, status=403)

        submission_phases = Submissions.objects.all().order_by("-date_close")
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


class FeedbackUploadView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def post(self, request, student_id):
        submission_id = request.data.get("submission")
        file = request.FILES.get("file")

        if not submission_id or not file:
            return Response({"detail": "Missing file or submission."}, status=400)

        try:
            submission = StudentSubmission.objects.get(
                id=submission_id, student__id=student_id
            )
        except StudentSubmission.DoesNotExist:
            return Response({"detail": "Student submission not found."}, status=404)

        feedback, created = Feedback.objects.get_or_create(
            submission=submission, supervisor=request.user, defaults={"file": file}
        )

        if not created:
            feedback.file = file
            feedback.save()

        serializer = FeedbackSerializer(feedback, context={"request": request})
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

        # Permission checks
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

        log.status = status_value
        log.save(update_fields=["status"])
        return Response(
            {"detail": "Status updated successfully.", "status": log.status},
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
        serializer = LogbookSerializer(logbooks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
