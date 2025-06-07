import json
from django.shortcuts import get_object_or_404
from django.template import TemplateDoesNotExist
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from backend import settings
from documents.models import Logbook, StudentSubmission
from .models import Student, SupervisorsRequest, User
from .serializers import (
    BreadcrumbSerializer,
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

    def get(self, request, student_id=None):
        url_name = request.resolver_match.url_name

        if url_name == "current_supervisor":
            if hasattr(request.user, "student") and request.user.student.supervisor:
                return Response(request.user.student.supervisor.name)
            return Response(None)

        if url_name == "current_student":
            student = get_object_or_404(Student, id=student_id)
            serializer = BreadcrumbSerializer(student, context={"request": request})
            return Response(serializer.data)

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
            try:
                supervisor_request = SupervisorsRequest.objects.get(
                    student_id=student_id
                )
                serializer = SupervisorChoiceSerializer(
                    supervisor_request, context={"request": request}
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            except SupervisorsRequest.DoesNotExist:
                return Response({}, status=status.HTTP_200_OK)
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

            if not student_id or not isinstance(choices, dict):
                return Response(
                    {
                        "error": "Invalid payload: studentId and choices (as an object) are required"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate required fields
            if (
                not choices.get("firstName")
                and not choices.get("secondName")
                and not choices.get("thirdName")
            ):
                return Response(
                    {"error": "At least one supervisor name is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Delete existing request for the student
            SupervisorsRequest.objects.filter(student_id=student_id).delete()

            # Create new request
            instance = SupervisorsRequest(
                student_id=student_id,
                first_id=choices.get("firstId"),
                first_name=choices.get("firstName"),
                first_proof=request.FILES.get("proof_first"),
                second_id=choices.get("secondId"),
                second_name=choices.get("secondName"),
                second_proof=request.FILES.get("proof_second"),
                third_id=choices.get("thirdId"),
                third_name=choices.get("thirdName"),
                third_proof=request.FILES.get("proof_third"),
                topic=choices.get("topic") or "",
                mode=choices.get("mode") or "development",
                cgpa=choices.get("cgpa") or 0.0,
            )
            instance.save()

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
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST
            )


class SuperviseeSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category=None):
        if (
            request.user.role != "supervisor"
            and request.user.role != "course_coordinator"
            and request.user.role != "examiner"
        ):
            return Response({"detail": "Unauthorized"}, status=403)

        if category:
            if category == "supervisor":
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

        if request.resolver_match.url_name == "evaluatees-submissions":
            target = Student.objects.filter(
                evaluators=request.user,
                user__is_active=True,
                course__in=["FYP1", "FYP2"],
            )
        else:
            target = Student.objects.filter(
                supervisor=request.user,
                user__is_active=True,
                course__in=["FYP1", "FYP2"],
            )

        result = []

        for student in target:
            all_submissions = StudentSubmission.objects.filter(
                student=student
            ).order_by("-upload_date")
            has_logbook = Logbook.objects.filter(student=student).exists()

            submissions_list = [
                {
                    "id": submission.id,
                    "status": "Reviewed"
                    if submission.feedback_set.filter(supervisor=request.user).exists()
                    else "Submitted",
                    "type": "submission",
                    "assignment_title": submission.submission_phase.title,
                }
                for submission in all_submissions
            ]

            result.append(
                {
                    "student": {
                        "id": student.id,
                        "name": student.user.name,
                        "email": student.user.email,
                        "course": student.course,
                        "mode": student.mode,
                        "student_id": student.student_id,
                        "supervisor": student.supervisor.name,
                        "topic": student.topic,
                    },
                    "submissions": submissions_list,
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


class UpdateStudentTopicView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, student_id):
        try:
            if request.user.role == "student":
                student = get_object_or_404(Student, user__id=student_id)
            else:
                student = get_object_or_404(Student, id=student_id)
            if (
                request.user.role != "course_coordinator"
                and request.user != student.user
                and (
                    request.user.role != "supervisor"
                    or student.supervisor != request.user
                )
            ):
                return Response(
                    {"error": "You are not authorized to update this student's topic"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            topic = request.data.get("topic")
            if topic is None:
                return Response(
                    {"error": "Topic is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate topic length
            if len(topic) > 255:
                return Response(
                    {"error": "Topic cannot exceed 255 characters"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            student.topic = topic
            student.save()

            return Response(
                {"message": "Topic updated successfully", "topic": student.topic},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
