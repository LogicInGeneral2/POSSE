from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
import urllib
from .models import SupervisorsRequest, User, Student
from django.utils.html import format_html
from django.contrib import messages
from import_export.admin import ImportExportModelAdmin
from .resources import UserResource, StudentResource
from django.core.mail import send_mail
from backend import settings
from django.db import transaction


class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Disable is_examiner and is_available for students
        if self.instance and self.instance.role == "student":
            self.fields["is_examiner"].disabled = True
            self.fields["is_available"].disabled = True

    def clean_password(self):
        return self.initial.get("password")


@admin.register(User)
class UserAdmin(ImportExportModelAdmin, BaseUserAdmin):
    resource_class = UserResource
    form = CustomUserChangeForm
    list_display = ("id", "name", "username", "email", "role")
    list_filter = ("role",)
    search_fields = ("name", "email", "username")
    ordering = ("id",)
    readonly_fields = ("username",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "role")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                    "is_available",
                    "is_examiner",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "role", "password1", "password2"),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password") and not change:
            obj.set_password(form.cleaned_data["password"])
        elif change:
            existing = User.objects.get(pk=obj.pk)
            if existing.password != obj.password:
                obj.set_password(obj.password)
        obj.save()

    def delete_model(self, request, obj):
        if obj.is_superuser:
            self.message_user(
                request, "Cannot delete a superadmin user.", messages.ERROR
            )
            return
        if obj == request.user:
            self.message_user(
                request, "Cannot delete the currently logged-in user.", messages.ERROR
            )
            return
        if obj.role in ["course_coordinator"]:
            self.message_user(
                request, "Cannot delete a Course Coordinator.", messages.ERROR
            )
            return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        restricted_users = []
        for obj in queryset:
            if obj.is_superuser:
                restricted_users.append(f"{obj.email} (superadmin)")
            if obj == request.user:
                restricted_users.append(f"{obj.email} (current user)")
            if obj.role in ["course_coordinator"]:
                restricted_users.append(f"{obj.email} (course coordinator)")
        if restricted_users:
            self.message_user(
                request,
                f"Cannot delete the following users: {', '.join(restricted_users)}.",
                messages.ERROR,
            )
            return
        super().delete_queryset(request, queryset)


@admin.register(Student)
class StudentAdmin(ImportExportModelAdmin):
    resource_class = StudentResource
    list_display = ("id", "user", "student_id", "course", "supervisor_name")
    list_filter = ("course",)
    search_fields = ("user__name", "student_id", "user__email")
    actions = ["promote_to_fyp2"]

    def supervisor_name(self, obj):
        return obj.supervisor.name if obj.supervisor else "-"

    supervisor_name.short_description = "Supervisor"

    @admin.action(description="Promote selected students to FYP2")
    def promote_to_fyp2(self, request, queryset):
        updated_count = queryset.filter(course="FYP1").update(course="FYP2")
        self.message_user(request, f"{updated_count} student(s) promoted to FYP2.")


@admin.register(SupervisorsRequest)
class SupervisorsRequestAdmin(ImportExportModelAdmin):
    list_display = (
        "id",
        "student",
        "supervisor_id",
        "supervisor_name",
        "topic",
        "mode",
        "priority",
        "proof_link",
        "approve_button",
    )
    list_filter = ("priority", "mode")
    search_fields = (
        "student__user__name",
        "student__student_id",
        "student__user__email",
    )
    actions = ["bulk_approve"]

    def proof_link(self, obj):
        if obj.proof:
            return format_html(
                '<a href="{}" target="_blank">View Proof</a>', obj.proof.url
            )
        return "-"

    proof_link.short_description = "Proof"

    def approve_button(self, obj):
        return format_html(
            '<a class="button" href="{}">Approve</a>',
            reverse("admin:approve_supervisor_request", args=[obj.pk]),
        )

    approve_button.short_description = "Approve"
    approve_button.allow_tags = True

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "approve/<int:request_id>/",
                self.admin_site.admin_view(self.process_approve),
                name="approve_supervisor_request",
            ),
        ]
        return custom_urls + urls

    def process_approve(self, request, request_id):
        """Process approval of a single supervisor request and update student profile."""
        if not request_id:
            self.message_user(request, "Invalid request ID.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Get supervisor request
        supervisor_request = self.get_object(request, request_id)
        if not supervisor_request:
            self.message_user(request, "Supervisor request not found.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Validate supervisor
        try:
            supervisor = User.objects.get(
                id=supervisor_request.supervisor_id, role="supervisor"
            )
        except User.DoesNotExist:
            self.message_user(
                request,
                f"Supervisor '{supervisor_request.supervisor_name}' not found. Please create the user first.",
                messages.WARNING,
            )
            return HttpResponseRedirect(
                reverse("admin:users_user_add")
                + f"?name={urllib.parse.quote(supervisor_request.supervisor_name)}&role=supervisor"
            )
        except User.MultipleObjectsReturned:
            self.message_user(
                request,
                "Multiple supervisors found with the same ID. Please contact support.",
                messages.ERROR,
            )
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Validate student profile
        try:
            student_profile = Student.objects.get(user_id=supervisor_request.student.id)
        except Student.DoesNotExist:
            self.message_user(request, "Student profile not found.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )
        except Student.MultipleObjectsReturned:
            self.message_user(
                request,
                "Multiple student profiles found. Please contact support.",
                messages.ERROR,
            )
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        try:
            with transaction.atomic():
                # Update student profile
                student_profile.supervisor = supervisor
                student_profile.topic = supervisor_request.topic or ""
                student_profile.mode = supervisor_request.mode or student_profile.mode
                student_profile.save()

                # Delete other supervisor requests
                SupervisorsRequest.objects.filter(
                    student=supervisor_request.student
                ).exclude(id=supervisor_request.id).delete()

                # Prepare success message
                success_message = (
                    f"Supervisor '{supervisor_request.supervisor_name}' assigned, "
                    f"mode set to '{student_profile.mode}', "
                    f"topic set to '{student_profile.topic}'"
                )
                self.message_user(request, success_message, messages.SUCCESS)

                # Send email notification
                try:
                    email = student_profile.user.email
                    if email:  # Check if email exists
                        subject = "Supervisor Request Approved"
                        message = (
                            f"Hi {student_profile.user.name},\n\n"
                            f"Your supervisor request has been approved.\n"
                            f"Assigned Supervisor: {supervisor.name}\n"
                            f"Requested Topic: {student_profile.topic or ''}\n"
                            f"Mode: {student_profile.mode}\n"
                            f"Please check your student profile for more details or contact your supervisor.\n\n"
                            f"Best regards,\n"
                            f"POSSE"
                        )
                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[email],
                            fail_silently=True,  # Changed to True to prevent email failures from rolling back transaction
                        )
                    else:
                        self.message_user(
                            request,
                            "Student email not found. Approval processed but no notification sent.",
                            messages.WARNING,
                        )
                except Exception as email_error:
                    self.message_user(
                        request,
                        f"Approval processed but email notification failed: {str(email_error)}",
                        messages.WARNING,
                    )

        except Exception as e:
            self.message_user(
                request,
                f"Failed to process approval: {str(e)}",
                messages.ERROR,
            )
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        return HttpResponseRedirect(
            reverse("admin:users_supervisorsrequest_changelist")
        )

    def bulk_approve(self, request, queryset):
        """Bulk approve selected supervisor requests and update student profiles."""
        success, failed = 0, 0
        for obj in queryset.select_related("student"):
            supervisor = User.objects.get(id=obj.supervisor_id, role="supervisor")
            student_profile = Student.objects.get(user_id=obj.student.id)

            # Update student profile with supervisor, mode, and topic
            student_profile.supervisor = supervisor
            student_profile.topic = obj.topic or ""
            student_profile.save()

            # Delete other supervisor requests for the student
            SupervisorsRequest.objects.filter(student=obj.student).delete()

        self.message_user(
            request,
            f"{success} requests approved successfully with student profiles updated. "
            f"{failed} failed. Ensure supervisor and student records exist.",
            messages.INFO,
        )

    bulk_approve.short_description = "Bulk Approve Selected Requests"
