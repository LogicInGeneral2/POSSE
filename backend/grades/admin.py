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
from users.utils import get_coordinator_course_filter
from django import forms
from import_export.admin import ExportMixin


# Rubric Admin
class RubricForm(forms.ModelForm):
    pic = forms.MultipleChoiceField(
        choices=Rubric.VALID_ROLES,
        widget=forms.CheckboxSelectMultiple,
        help_text="Select the roles responsible for this rubric.",
    )

    class Meta:
        model = Rubric
        fields = "__all__"

    def clean_pic(self):
        # Ensure the cleaned data is a list for JSONField compatibility
        return self.cleaned_data["pic"]


@admin.register(Rubric)
class RubricAdmin(ImportExportModelAdmin):
    resource_class = RubricResource
    form = RubricForm  # Use the custom form
    list_display = ("label", "weightage", "course", "steps", "pic")
    list_filter = ("course",)
    search_fields = ("label",)
    ordering = ("steps",)
    actions = ["get_scheme"]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            queryset = queryset.filter(course_filter)
        return queryset

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
                "rubric_steps",
                "label",
                "weightage",
                "max_mark",
                "mode",
            ]
        )
        return response

    get_scheme.short_description = "Download CSV scheme for Rubric/Criteria"


# Criteria Admin
@admin.register(Criteria)
class CriteriaAdmin(ImportExportModelAdmin):
    resource_class = CriteriaResource
    list_display = ("label", "weightage", "max_mark", "mode", "rubric")
    list_filter = ("rubric__course", "mode")
    search_fields = ("label", "rubric__label")
    list_select_related = ("rubric",)
    actions = ["get_scheme"]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            # Handle single or compound Q object
            courses = []
            if (
                course_filter.children
            ):  # Compound Q object (e.g., Q(course='FYP1') | Q(course='Both'))
                courses = [child[1] for child in course_filter.children]
            else:  # Single Q object (e.g., Q(course='FYP1'))
                courses = [course_filter[0][1]]
            queryset = queryset.filter(rubric__course__in=courses)
        return queryset

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
                "rubric_steps",
                "label",
                "weightage",
                "max_mark",
                "mode",
            ]
        )
        return response

    get_scheme.short_description = "Download CSV scheme for Rubric/Criteria"


# StudentMark Admin
@admin.register(StudentMark)
class StudentMarkAdmin(ExportMixin, admin.ModelAdmin):
    resource_class = StudentMarkResource
    list_display = ("student", "criteria", "evaluator", "mark")
    list_filter = ("criteria__rubric__course", "criteria__mode")
    search_fields = ("student__user__name", "criteria__label")
    list_select_related = ("student", "criteria", "evaluator")
    list_editable = ("mark",)
    actions = ["get_scheme"]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            # Handle single or compound Q object
            courses = []
            if course_filter.children:  # Compound Q object
                courses = [child[1] for child in course_filter.children]
            else:  # Single Q object
                courses = [course_filter[0][1]]
            queryset = queryset.filter(criteria__rubric__course__in=courses)
        return queryset

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
class StudentGradesAdmin(ExportMixin, admin.ModelAdmin):
    resource_class = StudentGradesResource
    list_display = ("student", "total_mark", "grade")
    search_fields = ("student__user__name",)
    list_select_related = ("student",)
    readonly_fields = ("grade", "total_mark", "student")
    actions = ["get_scheme"]

    def has_add_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            # Handle single or compound Q object
            courses = []
            if course_filter.children:  # Compound Q object
                courses = [child[1] for child in course_filter.children]
            else:  # Single Q object
                courses = [course_filter[0][1]]
            queryset = queryset.filter(student__course__in=courses)
        return queryset

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
