from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from details.models import Submissions
from .utils import IsSupervisor
from .models import Document, StudentSubmission
from .serializers import (
    CombinedSubmissionSerializer,
    DocumentSerializer,
    StudentSubmissionSerializer,
    FeedbackSerializer,
    SubmissionUploadSerializer,
)
from rest_framework.permissions import IsAuthenticated


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
        if request.user.role != "student" or request.user.student.id != student_id:
            return Response({"detail": "Unauthorized"}, status=403)
        submission = (
            StudentSubmission.objects.filter(student__id=student_id)
            .order_by("-upload_date")
            .first()
        )
        if submission:
            serializer = StudentSubmissionSerializer(submission)
            return Response(serializer.data)
        return Response({}, status=404)


class FeedbackUploadView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(supervisor=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


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
