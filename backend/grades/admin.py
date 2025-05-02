from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from users.models import CourseCoordinator
from users.utils import get_coordinator_course_filter
from .resources import GradeResource, MarkingSchemeResource
from .models import MarkingScheme, Grade
from .forms import BulkGradeUpdateForm, GradeAdminForm
from django.http import HttpResponseRedirect
from django.urls import path
from django.urls import reverse
from django.contrib import messages
from django.shortcuts import render
from django.contrib.admin import SimpleListFilter


@admin.register(MarkingScheme)
class MarkingSchemeAdmin(ImportExportModelAdmin):
    resource_class = MarkingSchemeResource
    list_display = ["label", "marks", "weightage", "pic", "course"]
    list_filter = ["pic", "course"]
    search_fields = ["label", "contents"]

    def get_queryset(self, request):
        """
        Filter the queryset to show only MarkingSchemes for the coordinator's course
        or those with course='Both', unless the user is a superuser.
        """
        qs = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            qs = qs.filter(course_filter)
        return qs

    def get_form(self, request, obj=None, **kwargs):
        """
        Modify the form to restrict course choices based on the coordinator's course.
        """
        form = super().get_form(request, obj, **kwargs)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator = CourseCoordinator.objects.get(user=request.user)
            if coordinator.course != "Both":
                # Restrict course choices to coordinator's course and 'Both'
                form.base_fields["course"].queryset = form.base_fields[
                    "course"
                ].queryset.filter(course__in=[coordinator.course, "Both"])
        return form

    def save_model(self, request, obj, form, change):
        """
        Prevent saving MarkingSchemes for courses outside the coordinator's permission.
        """
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit marking schemes for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        """
        Prevent deletion of MarkingSchemes for courses outside the coordinator's permission.
        """
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete marking schemes for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """
        Prevent deletion of MarkingSchemes for courses outside the coordinator's permission.
        """
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete marking schemes for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)


class StudentNameFilter(SimpleListFilter):
    title = "Student Name"
    parameter_name = "student_name"

    def lookups(self, request, model_admin):
        students = (
            Grade.objects.select_related("student__user")
            .values("student__user__name")
            .distinct()
        )
        return [(s["student__user__name"], s["student__user__name"]) for s in students]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(student__user__name=self.value())
        return queryset


class MarkingSchemeFilter(SimpleListFilter):
    title = "Marking Scheme"
    parameter_name = "marking_scheme"

    def lookups(self, request, model_admin):
        schemes = (
            Grade.objects.select_related("scheme").values("scheme__label").distinct()
        )
        return [(s["scheme__label"], s["scheme__label"]) for s in schemes]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(scheme__label=self.value())
        return queryset


@admin.register(Grade)
class GradeAdmin(ImportExportModelAdmin):  # change this line
    resource_class = GradeResource
    form = GradeAdminForm
    list_display = [
        "student_name",
        "scheme_label",
        "grader_name",
        "grades",
        "grade_summary",
        "created_at",
        "updated_at",
        "course",
    ]
    list_filter = [
        "scheme__pic",
        "grader__role",
        "student__course",
        ("created_at", admin.DateFieldListFilter),
        ("updated_at", admin.DateFieldListFilter),
        StudentNameFilter,
        MarkingSchemeFilter,
    ]
    search_fields = [
        "student__user__name",
        "grader__name",
        "scheme__label",
        "student__course",
    ]
    list_editable = ["grades"]
    list_per_page = 25
    raw_id_fields = ["student", "grader", "scheme"]
    autocomplete_fields = ["student", "grader", "scheme"]
    actions = ["export_grades_to_csv", "bulk_update_grades"]

    def get_form(self, request, obj=None, **kwargs):
        kwargs["form"] = GradeAdminForm
        kwargs["form"].request = request
        return super().get_form(request, obj, **kwargs)

    def get_queryset(self, request):
        qs = (
            super()
            .get_queryset(request)
            .select_related("student__user", "grader", "scheme")
        )
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator = CourseCoordinator.objects.get(user=request.user)
            if coordinator.course != "Both":
                qs = qs.filter(student__course__in=[coordinator.course, "Both"])
            # If course is "Both", no filtering needed
        return qs

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if (
                obj.student.course != coordinator_course
                and obj.student.course != "Both"
            ):
                self.message_user(
                    request,
                    f"You can only create/edit grades for students in {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if (
                obj.student.course != coordinator_course
                and obj.student.course != "Both"
            ):
                self.message_user(
                    request,
                    f"You can only delete grades for students in {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(student__course=coordinator_course).exclude(
                student__course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete grades for students in {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)

    def student_name(self, obj):
        return obj.student.user.name if obj.student.user else "N/A"

    student_name.short_description = "Student"
    student_name.admin_order_field = "student__user__name"

    def scheme_label(self, obj):
        return obj.scheme.label

    scheme_label.short_description = "Marking Scheme"
    scheme_label.admin_order_field = "scheme__label"

    def grader_name(self, obj):
        return obj.grader.name if obj.grader else "N/A"

    grader_name.short_description = "Grader"
    grader_name.admin_order_field = "grader__name"

    def course(self, obj):
        return obj.student.course if obj.student.course else "N/A"

    course.short_description = "Course"
    course.admin_order_field = "student__course"

    def grade_summary(self, obj):
        grades = obj.grades
        if isinstance(grades, list) and grades:
            return sum(grades)
        return "N/A"

    grade_summary.short_description = "Grade Total"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "bulk-update-grades/",
                self.admin_site.admin_view(self.bulk_update_grades_view),
                name="bulk-update-grades",
            ),
        ]
        return custom_urls + urls

    def bulk_update_grades_view(self, request):
        if request.method == "POST":
            form = BulkGradeUpdateForm(request.POST)
            if form.is_valid():
                grades = form.cleaned_data["grades"]
                grader = form.cleaned_data["grader"]
                queryset = self.get_queryset(request)
                updated = queryset.update(grades=grades, grader=grader)
                self.message_user(
                    request,
                    f"Successfully updated {updated} grades.",
                    messages.SUCCESS,
                )
                return HttpResponseRedirect(reverse("admin:grades_grade_changelist"))
        else:
            form = BulkGradeUpdateForm()

        return render(
            request,
            "admin/bulk_grade_update.html",
            {"form": form, "title": "Bulk Update Grades"},
        )
