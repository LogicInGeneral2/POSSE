from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.dispatch import receiver
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from .models import SupervisorsRequest, User, Student
from django.utils.html import format_html
from django.contrib import messages
from import_export.admin import ImportExportModelAdmin
from .resources import UserResource, StudentResource
from django.db.models.signals import post_save


class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = "__all__"

    def clean_password(self):
        # Return the initial value (unchanged)
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
        if obj.role in ["course_coordinator"]:
            raise forms.ValidationError("You cannot delete a Course Coordinator.")
        super().delete_model(request, obj)


@admin.register(Student)
class StudentAdmin(ImportExportModelAdmin):
    resource_class = StudentResource
    list_display = ("id", "user", "student_id", "course", "supervisor_name")
    list_filter = ("course",)
    search_fields = ("user__name", "student_id", "user__email")

    def supervisor_name(self, obj):
        return obj.supervisor.name if obj.supervisor else "-"

    supervisor_name.short_description = "Supervisor"


@admin.register(SupervisorsRequest)
class SupervisorsRequestAdmin(ImportExportModelAdmin):
    list_display = (
        "id",
        "student",
        "supervisor_id",
        "supervisor_name",
        "priority",
        "proof_link",
        "approve_button",
    )
    list_filter = ("priority",)
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
        supervisor_request = self.get_object(request, request_id)

        # Check if supervisor_id is valid
        try:
            supervisor = User.objects.get(
                id=supervisor_request.supervisor_id, role="supervisor"
            )
        except User.DoesNotExist:
            self.message_user(
                request,
                "Please create the user (Supervisor) first.",
                messages.WARNING,
            )
            url = (
                reverse("admin:users_user_add")
                + f"?name={supervisor_request.supervisor_name}&role=supervisor"
            )

            return HttpResponseRedirect(url)

        # Get or create student profile
        try:
            student_profile = Student.objects.get(user_id=supervisor_request.student.id)
        except Student.DoesNotExist:
            self.message_user(request, "Student profile not found.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Assign supervisor (overwrite)
        student_profile.supervisor = supervisor
        student_profile.save()

        # Delete other requests for this student
        SupervisorsRequest.objects.filter(student=supervisor_request.student).delete()

        self.message_user(
            request, "Supervisor assigned and other requests deleted.", messages.SUCCESS
        )
        return HttpResponseRedirect(
            reverse("admin:users_supervisorsrequest_changelist")
        )

    def bulk_approve(self, request, queryset):
        success, failed = 0, 0
        for obj in queryset:
            try:
                supervisor = User.objects.get(id=obj.supervisor_id, role="supervisor")
                student_profile = Student.objects.get(user_id=obj.student.id)
                student_profile.supervisor = supervisor
                student_profile.save()
                SupervisorsRequest.objects.filter(student=obj.student).delete()
                success += 1
            except Exception as e:  # noqa: F841
                failed += 1

        self.message_user(
            request,
            f"{success} approved. {failed} failed. Ensure supervisor IDs are valid and students exist.",
            messages.INFO,
        )

    bulk_approve.short_description = "Bulk Approve Selected Requests"


@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role == "Student":
        if not hasattr(instance, "student"):
            Student.objects.create(user=instance, student_id="TEMP")
