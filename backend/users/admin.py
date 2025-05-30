from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
import urllib
from documents.models import Logbook, StudentSubmission
from grades.models import Grade, TotalMarks
from .forms import CustomUserChangeForm, ExaminerSelectionForm, SupervisorSelectionForm
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
from django.db.models import Avg
from django.template.response import TemplateResponse


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


class CgpaRangeFilter(admin.SimpleListFilter):
    title = "CGPA Range"
    parameter_name = "cgpa"

    def lookups(self, request, model_admin):
        return (
            ("0-1", "0-1 CGPA"),
            ("1-2", "1-2 CGPA"),
            ("2-3", "2-3 CGPA"),
            ("3-4", "3-4 CGPA"),
        )

    def queryset(self, request, queryset):
        if self.value() == "0-1":
            return queryset.filter(cgpa__range=(0, 1))
        if self.value() == "1-2":
            return queryset.filter(cgpa__range=(1, 2))
        if self.value() == "2-3":
            return queryset.filter(cgpa__range=(2, 3))
        if self.value() == "3-4":
            return queryset.filter(cgpa__range=(3, 4))


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
    allowed_users = []

    # Check each user for restrictions
    for obj in queryset:
        if obj.is_superuser:
            restricted_users.append(f"{obj.email} (superadmin)")
        elif obj == request.user:
            restricted_users.append(f"{obj.email} (current user)")
        elif obj.role in ["course_coordinator"]:
            restricted_users.append(f"{obj.email} (course coordinator)")
        else:
            allowed_users.append(obj)

    # If there are restricted users, show an error message
    if restricted_users:
        self.message_user(
            request,
            f"Cannot delete the following users: {', '.join(restricted_users)}.",
            messages.ERROR,
        )

    # If there are allowed users, delete them
    if allowed_users:
        super().delete_queryset(
            request, User.objects.filter(id__in=[obj.id for obj in allowed_users])
        )

    # If no users were allowed, inform the user
    if not allowed_users and restricted_users:
        self.message_user(
            request,
            "No users were deleted because all selected users are restricted.",
            messages.WARNING,
        )

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
    actions = [
        "promote_to_fyp2",
        "bulk_assign_examiner",
        "bulk_assign_supervisor",
        "deactivate",
        "reactivate",
    ]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "select-examiner-bulk/<str:student_ids>/",
                self.admin_site.admin_view(self.select_examiner_for_bulk),
                name="select_examiner_for_bulk",
            ),
            path(
                "select-supervisor-bulk/<str:student_ids>/",
                self.admin_site.admin_view(self.select_supervisor_for_bulk),
                name="select_supervisor_for_bulk",
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

    def select_supervisor_for_bulk(self, request, student_ids):
        student_ids_list = student_ids.split(",")
        students = self.get_queryset(request).filter(id__in=student_ids_list)
        if not students.exists():
            self.message_user(request, "No valid students found.", messages.ERROR)
            return HttpResponseRedirect(reverse("admin:users_student_changelist"))

        if request.method == "POST":
            form = SupervisorSelectionForm(request.POST)
            if form.is_valid():
                selected_supervisor = form.cleaned_data["supervisor"]
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
                    try:
                        with transaction.atomic():
                            student.supervisor = selected_supervisor
                            student.save()
                            # Delete any existing supervisor requests for the student
                            SupervisorsRequest.objects.filter(
                                student=student.user
                            ).delete()
                            try:
                                student_email = student.user.email
                                supervisor_email = selected_supervisor.email
                                if student_email and supervisor_email:
                                    subject = "Supervisor Assigned to Your Project"
                                    message = (
                                        f"Hi {student.user.name},\n\n"
                                        f"A supervisor has been assigned to your project.\n"
                                        f"Assigned Supervisor: {selected_supervisor.name}\n"
                                        f"Please contact your supervisor for further details.\n\n"
                                        f"Best regards,\n"
                                        f"POSSE"
                                    )
                                    send_mail(
                                        subject=subject,
                                        message=message,
                                        from_email=settings.DEFAULT_FROM_EMAIL,
                                        recipient_list=[
                                            student_email,
                                            supervisor_email,
                                        ],
                                        fail_silently=True,
                                    )
                            except Exception as email_error:
                                self.message_user(
                                    request,
                                    f"Email notification failed for {student.user.name} - {selected_supervisor.name}: {str(email_error)}",
                                    messages.WARNING,
                                )
                            success_count += 1
                    except Exception as e:
                        failed_count += 1
                        self.message_user(
                            request,
                            f"Failed to assign supervisor to {student.user.name}: {str(e)}",
                            messages.WARNING,
                        )
                        continue

                self.message_user(
                    request,
                    f"{success_count} student(s) updated with supervisor. {failed_count} failed due to permission issues.",
                    messages.SUCCESS if success_count > 0 else messages.ERROR,
                )
                return HttpResponseRedirect(reverse("admin:users_student_changelist"))
        else:
            form = SupervisorSelectionForm()

        return render(
            request,
            "select_supervisor_form.html",
            {
                "form": form,
                "student_ids": student_ids,
                "students": students,
                "title": "Select Supervisor for Selected Students",
            },
        )

    @admin.action(description="Assign supervisor to selected students")
    def bulk_assign_supervisor(self, request, queryset):
        student_ids = ",".join(map(str, queryset.values_list("id", flat=True)))
        return HttpResponseRedirect(
            reverse("admin:select_supervisor_for_bulk", args=[student_ids])
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

        promoted_count = 0
        for student in queryset.filter(course="FYP1"):
            try:
                with transaction.atomic():
                    # Delete related data from models with ForeignKey to Student
                    Logbook.objects.filter(student=student).delete()
                    StudentSubmission.objects.filter(student=student).delete()
                    Grade.objects.filter(student=student).delete()
                    TotalMarks.objects.filter(student=student).delete()

                    # Clear many-to-many relationships (e.g., evaluators)
                    student.evaluators.clear()

                    # Promote to FYP2
                    student.course = "FYP2"
                    student.save()

                    promoted_count += 1
            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to promote {student.user.name}: {str(e)}",
                    messages.WARNING,
                )
                continue

        self.message_user(
            request,
            f"{promoted_count} student(s) promoted to FYP2 and related data cleared.",
            messages.SUCCESS if promoted_count > 0 else messages.ERROR,
        )

    @admin.action(description="Deactivate selected students and delete related data")
    def deactivate(self, request, queryset):
        updated_count = 0
        for student in queryset:
            if student.user.is_active:  # Only process active students
                try:
                    with transaction.atomic():
                        # Delete related data from models with ForeignKey to Student
                        Logbook.objects.filter(student=student).delete()
                        StudentSubmission.objects.filter(student=student).delete()
                        Grade.objects.filter(student=student).delete()
                        TotalMarks.objects.filter(student=student).delete()

                        # Clear many-to-many relationships (e.g., evaluators)
                        student.evaluators.clear()

                        # Deactivate the user and update the student's course
                        student.user.is_active = False
                        student.user.save()
                        student.course = "inactive"
                        student.save()

                        updated_count += 1
                except Exception as e:
                    self.message_user(
                        request,
                        f"Failed to deactivate {student.user.name}: {str(e)}",
                        messages.WARNING,
                    )
                    continue

        self.message_user(
            request,
            f"{updated_count} student(s) deactivated, marked as 'Inactive', and related data deleted.",
            messages.SUCCESS if updated_count > 0 else messages.ERROR,
        )

    @admin.action(description="Reactivate selected students")
    def reactivate(self, request, queryset):
        updated_count = 0
        for student in queryset:
            if not student.user.is_active:
                student.user.is_active = True
                student.user.save()
                student.course = "FYP2"
                student.save()
                updated_count += 1
        self.message_user(
            request, f"{updated_count} student(s) activated and moved to 'FYP2'."
        )

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
        "cgpa",
        "first_name_with_stats",  # Updated to include stats
        "approve_first_button",
        "preview_first_button",
        "second_name_with_stats",  # Updated to include stats
        "approve_second_button",
        "preview_second_button",
        "third_name_with_stats",  # Updated to include stats
        "approve_third_button",
        "preview_third_button",
        "topic",
        "mode",
        "first_proof_link",
        "second_proof_link",
        "third_proof_link",
    )
    list_filter = ("mode",)
    search_fields = (
        "student__user__name",
        "student__student_id",
        "student__user__email",
        "first_name",
        "second_name",
        "third_name",
    )
    actions = [
        "bulk_approve_first_choice",
        "bulk_approve_second_choice",
        "bulk_approve_third_choice",
    ]

    def first_name_with_stats(self, obj):
        if obj.first_name and obj.first_id:
            try:
                supervisor = User.objects.get(id=obj.first_id, role="supervisor")
                current_students = Student.objects.filter(supervisor=supervisor)
                student_count = current_students.count()
                avg_cgpa = current_students.filter(cgpa__gt=0).aggregate(
                    avg_cgpa=Avg("cgpa")
                )["avg_cgpa"]
                return format_html(
                    "{} (Students: {}, Avg CGPA: {})",
                    obj.first_name,
                    student_count,
                    round(avg_cgpa, 2) if avg_cgpa else "N/A",
                )
            except User.DoesNotExist:
                return obj.first_name
        return "-"

    first_name_with_stats.short_description = "First Supervisor"

    def second_name_with_stats(self, obj):
        if obj.second_name and obj.second_id:
            try:
                supervisor = User.objects.get(id=obj.second_id, role="supervisor")
                current_students = Student.objects.filter(supervisor=supervisor)
                student_count = current_students.count()
                avg_cgpa = current_students.filter(cgpa__gt=0).aggregate(
                    avg_cgpa=Avg("cgpa")
                )["avg_cgpa"]
                return format_html(
                    "{} (Students: {}, Avg CGPA: {})",
                    obj.second_name,
                    student_count,
                    round(avg_cgpa, 2) if avg_cgpa else "N/A",
                )
            except User.DoesNotExist:
                return obj.second_name
        return "-"

    second_name_with_stats.short_description = "Second Supervisor"

    def third_name_with_stats(self, obj):
        if obj.third_name and obj.third_id:
            try:
                supervisor = User.objects.get(id=obj.third_id, role="supervisor")
                current_students = Student.objects.filter(supervisor=supervisor)
                student_count = current_students.count()
                avg_cgpa = current_students.filter(cgpa__gt=0).aggregate(
                    avg_cgpa=Avg("cgpa")
                )["avg_cgpa"]
                return format_html(
                    "{} (Students: {}, Avg CGPA: {})",
                    obj.third_name,
                    student_count,
                    round(avg_cgpa, 2) if avg_cgpa else "N/A",
                )
            except User.DoesNotExist:
                return obj.third_name
        return "-"

    third_name_with_stats.short_description = "Third Supervisor"

    def preview_first_button(self, obj):
        if obj.first_name and obj.first_id:
            return format_html(
                '<a class="button" href="{}">Preview Impact</a>',
                reverse("admin:preview_supervisor_assignment", args=[obj.pk])
                + "?choice=first",
            )
        return "-"

    preview_first_button.short_description = "Preview"
    preview_first_button.allow_tags = True

    def preview_second_button(self, obj):
        if obj.second_name and obj.second_id:
            return format_html(
                '<a class="button" href="{}">Preview Impact</a>',
                reverse("admin:preview_supervisor_assignment", args=[obj.pk])
                + "?choice=second",
            )
        return "-"

    preview_second_button.short_description = "Preview"
    preview_second_button.allow_tags = True

    def preview_third_button(self, obj):
        if obj.third_name and obj.third_id:
            return format_html(
                '<a class="button" href="{}" >Preview Impact</a>',
                reverse("admin:preview_supervisor_assignment", args=[obj.pk])
                + "?choice=third",
            )
        return "-"

    preview_third_button.short_description = "Preview"
    preview_third_button.allow_tags = True

    def approve_first_button(self, obj):
        if obj.first_name and obj.first_id:
            return format_html(
                '<a class="button" href="{}" onclick="return confirm(\'Approve {} as supervisor?\')">Approve</a>',
                reverse("admin:approve_supervisor_request", args=[obj.pk])
                + "?choice=first",
                obj.first_name,
            )
        return "-"

    approve_first_button.short_description = "Action"
    approve_first_button.allow_tags = True

    def approve_second_button(self, obj):
        if obj.second_name and obj.second_id:
            return format_html(
                '<a class="button" href="{}" onclick="return confirm(\'Approve {} as supervisor?\')">Approve</a>',
                reverse("admin:approve_supervisor_request", args=[obj.pk])
                + "?choice=second",
                obj.second_name,
            )
        return "-"

    approve_second_button.short_description = "Action"
    approve_second_button.allow_tags = True

    def approve_third_button(self, obj):
        if obj.third_name and obj.third_id:
            return format_html(
                '<a class="button" href="{}" onclick="return confirm(\'Approve {} as supervisor?\')">Approve</a>',
                reverse("admin:approve_supervisor_request", args=[obj.pk])
                + "?choice=third",
                obj.third_name,
            )
        return "-"

    approve_third_button.short_description = "Action"
    approve_third_button.allow_tags = True

    def first_proof_link(self, obj):
        if obj.first_proof:
            return format_html(
                '<a href="{}" target="_blank">View Proof</a>', obj.first_proof.url
            )
        return "-"

    first_proof_link.short_description = "First Proof"

    def second_proof_link(self, obj):
        if obj.second_proof:
            return format_html(
                '<a href="{}" target="_blank">View Proof</a>', obj.second_proof.url
            )
        return "-"

    second_proof_link.short_description = "Second Proof"

    def third_proof_link(self, obj):
        if obj.third_proof:
            return format_html(
                '<a href="{}" target="_blank">View Proof</a>', obj.third_proof.url
            )
        return "-"

    third_proof_link.short_description = "Third Proof"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "approve/<int:request_id>/",
                self.admin_site.admin_view(self.process_approve),
                name="approve_supervisor_request",
            ),
            path(
                "preview/<int:request_id>/",
                self.admin_site.admin_view(self.preview_assignment),
                name="preview_supervisor_assignment",
            ),
        ]
        return custom_urls + urls

    def preview_assignment(self, request, request_id):
        """Show the impact of assigning a supervisor to a student"""
        supervisor_request = self.get_object(request, request_id)
        if not supervisor_request:
            self.message_user(request, "Supervisor request not found.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        choice = request.GET.get("choice", "first")
        if choice not in ["first", "second", "third"]:
            self.message_user(request, "Invalid choice specified.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Get supervisor details
        supervisor_id = None
        supervisor_name = None
        if choice == "first":
            supervisor_id = supervisor_request.first_id
            supervisor_name = supervisor_request.first_name
        elif choice == "second":
            supervisor_id = supervisor_request.second_id
            supervisor_name = supervisor_request.second_name
        elif choice == "third":
            supervisor_id = supervisor_request.third_id
            supervisor_name = supervisor_request.third_name

        if not supervisor_id:
            self.message_user(
                request, f"No supervisor found for {choice} choice.", messages.ERROR
            )
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        try:
            supervisor = User.objects.get(id=supervisor_id, role="supervisor")
        except User.DoesNotExist:
            supervisor = None

        # Calculate current and projected statistics
        current_students = (
            Student.objects.filter(supervisor=supervisor)
            if supervisor
            else Student.objects.none()
        )
        current_count = current_students.count()
        current_avg = current_students.filter(cgpa__gt=0).aggregate(
            avg_cgpa=Avg("cgpa")
        )["avg_cgpa"]

        # Calculate projected statistics if this student is assigned
        student_cgpa = supervisor_request.cgpa or 0
        projected_count = current_count + 1

        # Calculate projected average (only if student has CGPA > 0)
        if student_cgpa > 0:
            if current_avg:
                # Weighted average calculation
                current_total_cgpa = (
                    current_avg * current_students.filter(cgpa__gt=0).count()
                )
                projected_avg = (current_total_cgpa + student_cgpa) / (
                    current_students.filter(cgpa__gt=0).count() + 1
                )
            else:
                projected_avg = student_cgpa
        else:
            projected_avg = current_avg

        context = {
            "supervisor_request": supervisor_request,
            "choice": choice,
            "supervisor": supervisor,
            "supervisor_name": supervisor_name,
            "student_name": supervisor_request.student.name,
            "student_cgpa": student_cgpa,
            "current_count": current_count,
            "current_avg": round(current_avg, 2) if current_avg else 0,
            "projected_count": projected_count,
            "projected_avg": round(projected_avg, 2) if projected_avg else 0,
            "title": f"Preview Assignment Impact - {choice.title()} Choice",
        }

        return TemplateResponse(
            request, "admin/preview_supervisor_assignment.html", context
        )

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

        # Get the selected choice from query parameter
        choice = request.GET.get(
            "choice", "first"
        )  # Default to 'first' if not specified
        if choice not in ["first", "second", "third"]:
            self.message_user(request, "Invalid choice specified.", messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:users_supervisorsrequest_changelist")
            )

        # Map choice to supervisor ID and name
        supervisor_id = None
        supervisor_name = None
        if choice == "first":
            supervisor_id = supervisor_request.first_id
            supervisor_name = supervisor_request.first_name
        elif choice == "second":
            supervisor_id = supervisor_request.second_id
            supervisor_name = supervisor_request.second_name
        elif choice == "third":
            supervisor_id = supervisor_request.third_id
            supervisor_name = supervisor_request.third_name

        if not supervisor_id or not supervisor_name:
            self.message_user(
                request,
                f"No supervisor found for {choice} choice.",
                messages.WARNING,
            )
            return HttpResponseRedirect(
                reverse("admin:users_user_add")
                + f"?name={urllib.parse.quote(supervisor_name or '')}&role=supervisor"
            )

        try:
            supervisor = User.objects.get(id=supervisor_id, role="supervisor")
        except User.DoesNotExist:
            self.message_user(
                request,
                f"Supervisor '{supervisor_name}' not found. Please create the user first.",
                messages.WARNING,
            )
            return HttpResponseRedirect(
                reverse("admin:users_user_add")
                + f"?name={urllib.parse.quote(supervisor_name or '')}&role=supervisor"
            )
        except User.MultipleObjectsReturned:
            self.message_user(
                request,
                f"Multiple supervisors found for {supervisor_name}. Please contact support.",
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
                student_profile.cgpa = supervisor_request.cgpa or 0
                student_profile.save()

                # Delete the supervisor request for the student
                supervisor_request.delete()

                success_message = (
                    f"Supervisor '{supervisor_name}' assigned, "
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
                            f"Assigned Supervisor: {supervisor_name}\n"
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

    def bulk_approve_first_choice(self, request, queryset):
        self.bulk_approve_choice(request, queryset, "first")

    bulk_approve_first_choice.short_description = "Bulk Approve First Choice"

    def bulk_approve_second_choice(self, request, queryset):
        self.bulk_approve_choice(request, queryset, "second")

    bulk_approve_second_choice.short_description = "Bulk Approve Second Choice"

    def bulk_approve_third_choice(self, request, queryset):
        self.bulk_approve_choice(request, queryset, "third")

    bulk_approve_third_choice.short_description = "Bulk Approve Third Choice"

    def bulk_approve_choice(self, request, queryset, choice):
        success, failed = 0, 0
        for obj in queryset.select_related("student"):
            supervisor_id = None
            supervisor_name = None
            if choice == "first":
                supervisor_id = obj.first_id
                supervisor_name = obj.first_name
            elif choice == "second":
                supervisor_id = obj.second_id
                supervisor_name = obj.second_name
            elif choice == "third":
                supervisor_id = obj.third_id
                supervisor_name = obj.third_name

            if not supervisor_id or not supervisor_name:
                failed += 1
                continue

            try:
                supervisor = User.objects.get(id=supervisor_id, role="supervisor")
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                failed += 1
                continue

            try:
                student_profile = Student.objects.get(user_id=obj.student.id)
                student_profile.supervisor = supervisor
                student_profile.topic = obj.topic or ""
                student_profile.mode = obj.mode or student_profile.mode
                student_profile.cgpa = obj.cgpa or 0
                student_profile.save()

                obj.delete()
                success += 1
            except (Student.DoesNotExist, Student.MultipleObjectsReturned):
                failed += 1

        self.message_user(
            request,
            f"{success} {choice} choice requests approved successfully with student profiles updated. "
            f"{failed} failed. Ensure supervisor and student records exist.",
            messages.INFO,
        )
