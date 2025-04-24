from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .resources import MarkingSchemeResource
from .models import MarkingScheme, Grade
from .forms import BulkGradeUpdateForm, GradeAdminForm
from django.http import HttpResponseRedirect
import csv
from django.http import HttpResponse
from django.urls import path
from django.urls import reverse
from django.contrib import messages
from django.shortcuts import render
from django.contrib.admin import SimpleListFilter


@admin.register(MarkingScheme)
class MarkingSchemeAdmin(ImportExportModelAdmin):
    resource_class = MarkingSchemeResource
    list_display = ["label", "marks", "weightage", "pic"]
    list_filter = ["pic"]
    search_fields = ["label", "contents"]


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
class GradeAdmin(admin.ModelAdmin):
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
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("student__user", "grader", "scheme")
        )

    # Custom display methods
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

    # Custom action: Export grades to CSV
    def export_grades_to_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="grades_export.csv"'
        writer = csv.writer(response)
        writer.writerow(
            [
                "Student",
                "Course",
                "Grades by Marking Scheme",
                "Total Grade",
                "Created At (Earliest)",
                "Updated At (Latest)",
            ]
        )

        # Group grades by student, ensuring no duplicates
        student_ids = queryset.values("student").distinct()
        for student_id in student_ids:
            student_grades = queryset.filter(
                student=student_id["student"]
            ).select_related("student__user", "scheme")
            if not student_grades.exists():
                continue

            # Get student details from the first grade entry
            first_grade = student_grades.first()
            student_name = first_grade.student.user.name or "N/A"
            student_course = first_grade.student.course or "N/A"

            # Combine grades and marking schemes
            grades_by_scheme = {
                grade.scheme.label: grade.grades for grade in student_grades
            }
            total_grade = (
                sum(
                    sum(grade.grades)
                    for grade in student_grades
                    if isinstance(grade.grades, list) and grade.grades
                )
                or "N/A"
            )

            # Get earliest created_at and latest updated_at
            created_at = (
                student_grades.order_by("created_at").first().created_at
                if student_grades.exists()
                else "N/A"
            )
            updated_at = (
                student_grades.order_by("-updated_at").first().updated_at
                if student_grades.exists()
                else "N/A"
            )

            writer.writerow(
                [
                    student_name,
                    student_course,
                    str(grades_by_scheme),
                    total_grade,
                    created_at,
                    updated_at,
                ]
            )
        return response

    export_grades_to_csv.short_description = "Export selected grades to CSV"

    # Add custom URLs for bulk update
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

    # Enable autocomplete for foreign key fields
    search_fields = ["student__user__name", "grader__name", "scheme__label"]
    autocomplete_fields = ["student", "grader", "scheme"]
