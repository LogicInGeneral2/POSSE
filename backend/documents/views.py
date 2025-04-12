from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import Student
from details.models import Submissions
from .utils import IsSupervisor
from .models import Document, Feedback, StudentSubmission
from .serializers import (
    CombinedSubmissionSerializer,
    DocumentSerializer,
    StudentAllSubmissionSerializer,
    StudentSubmissionSerializer,
    FeedbackSerializer,
    SubmissionUploadSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404


class DocumentListView(APIView):
    def get(self, request):
        documents = Document.objects.all()
        serializer = DocumentSerializer(
            documents, many=True, context={"request": request}
        )
        return Response(serializer.data)


class StudentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        student = get_object_or_404(Student, id=student_id)

        if request.path.endswith("all/"):
            if request.user.role not in [
                "supervisor",
                "examiner",
                "course_coordinator",
            ]:
                return Response({"detail": "Unauthorized"}, status=403)

            # Get all actual submissions made by the student
            submissions = StudentSubmission.objects.filter(student=student)

            serializer = StudentAllSubmissionSerializer(
                submissions, many=True, context={"request": request}
            )
            return Response(serializer.data)

        if request.user.role == "student" and request.user.id != student.user.id:
            return Response({"detail": "Unauthorized"}, status=403)

        submission_phases = Submissions.objects.all().order_by("-date_close")
        serializer = CombinedSubmissionSerializer(
            submission_phases,
            many=True,
            context={"request": request, "student": student},
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
