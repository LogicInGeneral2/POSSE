import json
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from documents.models import Logbook, StudentSubmission
from .models import Student, SupervisorsRequest, User
from .serializers import (
    SupervisorChoiceSerializer,
    SupervisorsListSerializer,
    UserSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import status


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.path.endswith("supervisor/"):
            if hasattr(request.user, "student") and request.user.student.supervisor:
                return Response(request.user.student.supervisor.name)
            return Response(None)
        return Response(UserSerializer(request.user).data)


class AvailableSupervisorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        supervisors = User.objects.filter(role="supervisor", is_available=True)
        serializer = SupervisorsListSerializer(supervisors, many=True)
        return Response(serializer.data)


class SupervisorListsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        choices = SupervisorsRequest.objects.filter(student_id=student_id).order_by(
            "priority"
        )
        serializer = SupervisorChoiceSerializer(
            choices, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            student_id = request.data.get("studentId")
            raw_choices = request.data.get("choices")

            if isinstance(raw_choices, str):
                choices = json.loads(raw_choices)
            else:
                choices = raw_choices

            if not student_id or not isinstance(choices, list):
                return Response(
                    {"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Delete existing choices for student
            SupervisorsRequest.objects.filter(student_id=student_id).delete()

            instances = []
            for choice in choices:
                priority = choice.get("priority")
                proof_field_name = f"proof_{priority}"  # Expect proof_1, proof_2, etc.
                proof_file = request.FILES.get(proof_field_name)

                instance = SupervisorsRequest(
                    student_id=student_id,
                    supervisor_id=choice.get("supervisorId"),
                    supervisor_name=choice.get("supervisorName"),
                    priority=priority,
                    proof=proof_file or None,
                )
                instances.append(instance)

            SupervisorsRequest.objects.bulk_create(instances)

            return Response(
                {"message": "Supervisor choices saved successfully."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get the refresh token from the request data
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # This blacklists the refresh token, effectively logging the user out
            return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST
            )


class SuperviseeSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category=None):  # Add 'category=None' here
        if request.user.role != "supervisor":
            return Response({"detail": "Unauthorized"}, status=403)

        if category:  # Check if category is provided
            if (
                category == "supervisor"
            ):  # You can now compare the category to determine the logic
                target = Student.objects.filter(supervisor=request.user)
            else:
                target = Student.objects.filter(evaluators=request.user)

            result = []
            for student in target:
                submissions = StudentSubmission.objects.filter(student=student)
                has_logbook = Logbook.objects.filter(student=student).exists()
                result.append(
                    {
                        "id": student.id,
                        "name": student.user.name,
                        "submissionsLength": submissions.count(),
                        "has_logbook": has_logbook,
                    }
                )
            return Response(result)

        if request.path.endswith("evaluatees/"):
            target = Student.objects.filter(evaluators=request.user)
        else:
            target = Student.objects.filter(supervisor=request.user)

        result = []
        for student in target:
            latest_submission = (
                StudentSubmission.objects.filter(student=student)
                .order_by("-upload_date")
                .first()
            )

            has_logbook = Logbook.objects.filter(student=student).exists()

            result.append(
                {
                    "student": {
                        "id": student.id,
                        "name": student.user.name,
                        "email": student.user.email,
                        "course": student.course,
                        "student_id": student.student_id,
                        "supervisor": request.user.name,
                    },
                    "submissions": []
                    if not latest_submission
                    else [
                        {
                            "id": latest_submission.id,
                            "title": latest_submission.file.name.split("/")[-1],
                            "upload_date": latest_submission.upload_date,
                            "src": latest_submission.file.url,
                            "status": "Reviewed"
                            if latest_submission.feedback_set.exists()
                            else "Submitted",
                            "type": "submission",
                            "studentId": student.id,
                            "assignmentId": latest_submission.submission_phase.id,
                        }
                    ],
                    "has_logbook": has_logbook,
                }
            )

        return Response(result)
