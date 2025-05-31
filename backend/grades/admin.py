from django.contrib import admin
from django.http import HttpResponse
from grades.resources import (
    CriteriaResource,
    GradeResource,
    RubricResource,
    StudentGradesResource,
    StudentMarkResource,
)
from .models import Grade, Rubric, Criteria, StudentMark, StudentGrade
from import_export.admin import ImportExportModelAdmin
import csv


# Rubric Admin
@admin.register(Rubric)
class RubricAdmin(ImportExportModelAdmin):
    resource_class = RubricResource
    list_display = ("label", "weightage", "course", "mode", "steps", "pic")
    list_filter = ("course", "mode")
    search_fields = ("label",)
    ordering = ("steps",)
    actions = ["get_scheme"]

    def get_scheme(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="rubric_criteria_scheme.csv"'
        )
        writer = csv.writer(response)
        writer.writerow(
            [
                "rubric_label",
                "rubric_weightage",
                "rubric_pic",
                "rubric_course",
                "rubric_mode",
                "rubric_steps",
                "label",
                "weightage",
                "max_mark",
            ]
        )
        return response

    get_scheme.short_description = "Download CSV scheme for Rubric/Criteria"


# Criteria Admin
@admin.register(Criteria)
class CriteriaAdmin(ImportExportModelAdmin):
    resource_class = CriteriaResource
    list_display = ("label", "weightage", "max_mark", "rubric")
    list_filter = ("rubric__course", "rubric__mode")
    search_fields = ("label", "rubric__label")
    list_select_related = ("rubric",)
    actions = ["get_scheme"]

    def get_scheme(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="rubric_criteria_scheme.csv"'
        )
        writer = csv.writer(response)
        writer.writerow(
            [
                "rubric_label",
                "rubric_weightage",
                "rubric_pic",
                "rubric_course",
                "rubric_mode",
                "rubric_steps",
                "label",
                "weightage",
                "max_mark",
            ]
        )
        return response

    get_scheme.short_description = "Download CSV scheme for Rubric/Criteria"


# StudentMark Admin
@admin.register(StudentMark)
class StudentMarkAdmin(ImportExportModelAdmin):
    resource_class = StudentMarkResource
    list_display = ("student", "criteria", "evaluator", "mark")
    list_filter = ("criteria__rubric__course", "criteria__rubric__mode")
    search_fields = ("student__first_name", "student__last_name", "criteria__label")
    list_select_related = ("student", "criteria", "evaluator")
    actions = ["get_scheme"]

    def get_scheme(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="studentmark_scheme.csv"'
        )
        writer = csv.writer(response)
        writer.writerow(["student_id", "criteria_id", "evaluator_id", "mark"])
        return response

    get_scheme.short_description = "Download CSV scheme for StudentMark"


# StudentGrades Admin
@admin.register(StudentGrade)
class StudentGradesAdmin(ImportExportModelAdmin):
    resource_class = StudentGradesResource
    list_display = ("student", "total_mark", "grade")
    search_fields = ("student__first_name", "student__last_name")
    list_select_related = ("student",)
    readonly_fields = ("grade", "total_mark", "student")
    actions = ["get_scheme"]

    def get_scheme(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="studentgrades_scheme.csv"'
        )
        writer = csv.writer(response)
        writer.writerow(["student_id", "total_mark"])
        return response

    get_scheme.short_description = "Download CSV scheme for StudentGrades"


# Grade Admin
@admin.register(Grade)
class GradeAdmin(ImportExportModelAdmin):
    resource_class = GradeResource
    list_display = (
        "grade_letter",
        "gpa_value",
        "min_mark",
        "max_mark",
        "range_display",
    )
    search_fields = ("grade_letter",)
    ordering = ("-min_mark",)
    list_editable = ("gpa_value", "min_mark", "max_mark")
    list_per_page = 20

    def range_display(self, obj):
        return f"{obj.min_mark} – {obj.max_mark}"

    range_display.short_description = "Mark Range"

    def save_model(self, request, obj, form, change):
        if obj.min_mark > obj.max_mark:
            from django.core.exceptions import ValidationError

            raise ValidationError(
                "Minimum mark must be less than or equal to maximum mark."
            )
        super().save_model(request, obj, form, change)
