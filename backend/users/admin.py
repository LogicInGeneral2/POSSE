from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
import urllib
from .forms import CustomUserChangeForm, ExaminerSelectionForm
from .models import SupervisorsRequest, User, Student, CourseCoordinator
from django.utils.html import format_html
from django.contrib import messages
from import_export.admin import ImportExportModelAdmin
from .resources import UserResource, StudentResource
from django.core.mail import send_mail
from backend import settings
from django.db import transaction
from .utils import get_coordinator_course_filter
from django.shortcuts import render


# Inline for Supervisees (students supervised by a supervisor)
class SuperviseeInline(admin.TabularInline):
    model = Student
    fk_name = "supervisor"
    fields = ("student_id", "user", "course", "topic", "mode")
    readonly_fields = ("student_id", "user", "course", "topic", "mode")
    extra = 0
    verbose_name = "Supervised Student"
    verbose_name_plural = "Supervised Students"

    def has_add_permission(self, request, obj=None):
        return False  # Prevent adding new students directly from the User admin

    def has_change_permission(self, request, obj=None):
        return False  # Make the inline read-only

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deleting students from the inline


# Inline for Evaluatees (students evaluated by an examiner)
class EvaluateeInline(admin.TabularInline):
    model = (
        Student.evaluators.through
    )  # Access the through model for the ManyToManyField
    fields = ("student", "course", "topic", "mode")
    readonly_fields = ("student", "course", "topic", "mode")
    extra = 0
    verbose_name = "Evaluated Student"
    verbose_name_plural = "Evaluated Students"

    def course(self, obj):
        return obj.student.course

    def topic(self, obj):
        return obj.student.topic or "-"

    def mode(self, obj):
        return obj.student.mode

    def has_add_permission(self, request, obj=None):
        return False  # Prevent adding new evaluatees directly

    def has_change_permission(self, request, obj=None):
        return False  # Make the inline read-only

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deleting evaluatees from the inline


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
        ("Personal info", {"fields": ("name", "role", "course")}),
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
                "fields": ("email", "name", "role", "course", "password"),
            },
        ),
    )

    # Add inlines for supervisees and evaluatees
    inlines = [SuperviseeInline, EvaluateeInline]

    def get_form(self, request, obj=None, **kwargs):
        kwargs["form"] = CustomUserChangeForm
        kwargs["form"].request = request  # Pass request to form
        return super().get_form(request, obj, **kwargs)

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password") and not change:
            obj.set_password(form.cleaned_data["password"])
        elif change:
            existing = User.objects.get(pk=obj.pk)
            if existing.password != obj.password:
                obj.set_password(obj.password)
        obj.save()

        # Automatically create/update CourseCoordinator profile for course_coordinator
        if obj.role == "course_coordinator":
            course = form.cleaned_data.get("course")
            try:
                coordinator = CourseCoordinator.objects.get(user=obj)
                coordinator.course = course
                coordinator.save()
            except CourseCoordinator.DoesNotExist:
                CourseCoordinator.objects.create(user=obj, course=course)

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

    def get_inlines(self, request, obj):
        # Only show inlines for users with supervisor or examiner roles
        if obj and obj.role in ["supervisor", "examiner"]:
            return [SuperviseeInline, EvaluateeInline]
        return []


@admin.register(CourseCoordinator)
class CourseCoordinatorAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "course")
    list_filter = ("course",)
    search_fields = ("user__name", "user__email")
    fields = ("user", "course")

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related("user")
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            return qs.filter(course_filter)
        return qs

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = super().get_readonly_fields(request, obj)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter and obj:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                return self.fields
        return readonly_fields

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit coordinators for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete coordinators for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete coordinators for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)


@admin.register(Student)
class StudentAdmin(ImportExportModelAdmin):
    resource_class = StudentResource
    list_display = (
        "id",
        "user",
        "student_id",
        "course",
        "supervisor_name",
    )
    list_filter = ("course",)
    search_fields = ("user__name", "student_id", "user__email")
    actions = ["promote_to_fyp2", "bulk_assign_examiner"]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "select-examiner-bulk/<str:student_ids>/",
                self.admin_site.admin_view(self.select_examiner_for_bulk),
                name="select_examiner_for_bulk",
            ),
        ]
        return custom_urls + urls

    def select_examiner_for_bulk(self, request, student_ids):
        student_ids_list = student_ids.split(",")
        students = self.get_queryset(request).filter(id__in=student_ids_list)
        if not students.exists():
            self.message_user(request, "No valid students found.", messages.ERROR)
            return HttpResponseRedirect(reverse("admin:users_student_changelist"))

        if request.method == "POST":
            form = ExaminerSelectionForm(request.POST)
            if form.is_valid():
                selected_examiners = form.cleaned_data["examiners"]
                course_filter, is_coordinator = get_coordinator_course_filter(request)
                success_count = 0
                failed_count = 0

                for student in students:
                    if is_coordinator and course_filter:
                        coordinator_course = CourseCoordinator.objects.get(
                            user=request.user
                        ).course
                        if (
                            student.course != coordinator_course
                            and student.course != "Both"
                        ):
                            failed_count += 1
                            continue
                    if not student.supervisor:
                        failed_count += 1
                        continue
                    try:
                        with transaction.atomic():
                            for examiner in selected_examiners:
                                student.evaluators.add(examiner)
                                try:
                                    student_email = student.user.email
                                    examiner_email = examiner.email
                                    if student_email and examiner_email:
                                        subject = "Examiner Assigned to Your Project"
                                        message = (
                                            f"Hi {student.user.name},\n\n"
                                            f"An examiner has been assigned to your project.\n"
                                            f"Assigned Examiner: {examiner.name}\n"
                                            f"Please contact your examiner for further details.\n\n"
                                            f"Best regards,\n"
                                            f"POSSE"
                                        )
                                        send_mail(
                                            subject=subject,
                                            message=message,
                                            from_email=settings.DEFAULT_FROM_EMAIL,
                                            recipient_list=[
                                                student_email,
                                                examiner_email,
                                            ],
                                            fail_silently=True,
                                        )
                                except Exception as email_error:
                                    self.message_user(
                                        request,
                                        f"Email notification failed for {student.user.name} - {examiner.name}: {str(email_error)}",
                                        messages.WARNING,
                                    )
                            student.save()
                            success_count += 1
                    except Exception as e:
                        failed_count += 1
                        self.message_user(
                            request,
                            f"Failed to assign examiners to {student.user.name}: {str(e)}",
                            messages.WARNING,
                        )
                        continue

                self.message_user(
                    request,
                    f"{success_count} student(s) updated. {failed_count} failed due to permission or supervisor issues.",
                    messages.SUCCESS if success_count > 0 else messages.ERROR,
                )
                return HttpResponseRedirect(reverse("admin:users_student_changelist"))
        else:
            form = ExaminerSelectionForm()

        return render(
            request,
            "select_examiner_form.html",
            {
                "form": form,
                "student_ids": student_ids,
                "students": students,
                "title": "Select Examiner for Selected Students",
            },
        )

    @admin.action(description="Assign examiner to selected students")
    def bulk_assign_examiner(self, request, queryset):
        student_ids = ",".join(map(str, queryset.values_list("id", flat=True)))
        return HttpResponseRedirect(
            reverse("admin:select_examiner_for_bulk", args=[student_ids])
        )

    def supervisor_name(self, obj):
        return obj.supervisor.name if obj.supervisor else "-"

    @admin.action(description="Promote selected students to FYP2")
    def promote_to_fyp2(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if coordinator_course == "FYP2":
                self.message_user(
                    request,
                    "FYP2 coordinators cannot promote students to FYP2.",
                    messages.ERROR,
                )
                return
        updated_count = queryset.filter(course="FYP1").update(course="FYP2")
        self.message_user(request, f"{updated_count} student(s) promoted to FYP2.")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            return qs.filter(course_filter)
        return qs

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit students for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete students for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete students for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)


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
        if not request_id:
            self.message_user(request, "Invalid request ID.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        supervisor_request = self.get_object(request, request_id)
        if not supervisor_request:
            self.message_user(request, "Supervisor request not found.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

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
                student_profile.supervisor = supervisor
                student_profile.topic = supervisor_request.topic or ""
                student_profile.mode = supervisor_request.mode or student_profile.mode
                student_profile.save()

                SupervisorsRequest.objects.filter(
                    student=supervisor_request.student
                ).exclude(id=supervisor_request.id).delete()

                success_message = (
                    f"Supervisor '{supervisor_request.supervisor_name}' assigned, "
                    f"mode set to '{student_profile.mode}', "
                    f"topic set to '{student_profile.topic}'"
                )
                self.message_user(request, success_message, messages.SUCCESS)

                try:
                    email = student_profile.user.email
                    if email:
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
                            fail_silently=True,
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
        success, failed = 0, 0
        for obj in queryset.select_related("student"):
            try:
                supervisor = User.objects.get(id=obj.supervisor_id, role="supervisor")
                student_profile = Student.objects.get(user_id=obj.student.id)

                student_profile.supervisor = supervisor
                student_profile.topic = obj.topic or ""
                student_profile.save()

                SupervisorsRequest.objects.filter(student=obj.student).delete()
                success += 1
            except (User.DoesNotExist, Student.DoesNotExist):
                failed += 1

        self.message_user(
            request,
            f"{success} requests approved successfully with student profiles updated. "
            f"{failed} failed. Ensure supervisor and student records exist.",
            messages.INFO,
        )

    bulk_approve.short_description = "Bulk Approve Selected Requests"
