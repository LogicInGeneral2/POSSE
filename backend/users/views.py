import json
from django.template import TemplateDoesNotExist
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from backend import settings
from documents.models import Logbook, StudentSubmission
from .models import Student, SupervisorsRequest, User
from .serializers import (
    SupervisorChoiceSerializer,
    SupervisorsListSerializer,
    UserSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
import smtplib
import re


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
        try:
            choices = SupervisorsRequest.objects.filter(student_id=student_id).order_by(
                "priority"
            )
            serializer = SupervisorChoiceSerializer(
                choices, many=True, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            student_id = request.data.get("studentId")
            raw_choices = request.data.get("choices")

            if isinstance(raw_choices, str):
                choices = json.loads(raw_choices)
            else:
                choices = raw_choices

            if not student_id or not isinstance(choices, list) or not choices:
                return Response(
                    {"error": "Invalid payload: studentId and choices are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate choices
            for choice in choices:
                if not choice.get("supervisorName") or not choice.get("priority"):
                    return Response(
                        {"error": "Each choice must have supervisorName and priority"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Delete existing choices for student
            SupervisorsRequest.objects.filter(student_id=student_id).delete()

            instances = []
            for choice in choices:
                priority = choice.get("priority")
                proof_field_name = f"proof_{priority}"
                proof_file = request.FILES.get(proof_field_name)

                instance = SupervisorsRequest(
                    student_id=student_id,
                    supervisor_id=choice.get("supervisorId"),
                    supervisor_name=choice.get("supervisorName"),
                    priority=priority,
                    proof=proof_file,
                    topic=choice.get("topic") or "",
                    mode=choice.get("mode") or "development",
                )
                instances.append(instance)

            SupervisorsRequest.objects.bulk_create(instances)

            return Response(
                {"message": "Supervisor choices saved successfully"},
                status=status.HTTP_201_CREATED,
            )

        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON in choices"}, status=status.HTTP_400_BAD_REQUEST
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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get("email")

            if not email:
                return Response(
                    {"error": "Email is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate email format
            email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
            if not re.match(email_regex, email):
                return Response(
                    {"error": "Invalid email format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)

                token_generator = PasswordResetTokenGenerator()
                token = token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))

                reset_url = (
                    f"http://localhost:5173/reset-password/confirm/{uid}/{token}"
                )

                try:
                    email_body = render_to_string(
                        "password_reset_email.html",
                        {
                            "user": user,
                            "reset_url": reset_url,
                        },
                    )
                except TemplateDoesNotExist:
                    return Response(
                        {"error": "Email template not found"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                try:
                    send_mail(
                        subject="POSSE Password Reset Request",
                        message=email_body,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except smtplib.SMTPAuthenticationError:
                    return Response(
                        {"error": "Invalid email configuration"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                except smtplib.SMTPException:
                    return Response(
                        {"error": "Failed to send email"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                return Response(
                    {"message": "Password reset email sent successfully"},
                    status=status.HTTP_200_OK,
                )

            except User.DoesNotExist:
                return Response(
                    {"error": "No account found with this email address"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Use DRF's request.data instead of json.loads
            uidb64 = request.data.get("uid")
            token = request.data.get("token")
            password = request.data.get("password")

            if not all([uidb64, token, password]):
                return Response(
                    {"error": "Missing required fields"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)

                token_generator = PasswordResetTokenGenerator()
                if token_generator.check_token(user, token):
                    user.set_password(password)
                    user.save()
                    return Response(
                        {"message": "Password reset successful"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"error": "Invalid or expired token"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(
                    {"error": "Invalid token or user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            old_password = request.data.get("old_password")
            new_password = request.data.get("new_password")

            if not all([old_password, new_password]):
                return Response(
                    {"error": "Old password and new password are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = request.user
            if not user.check_password(old_password):
                return Response(
                    {"error": "Incorrect old password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Password changed successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
