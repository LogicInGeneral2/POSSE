# grades/forms.py
from django import forms
from users.models import User, Student
from .models import Grade
from users.utils import get_coordinator_course_filter


class BulkGradeUpdateForm(forms.Form):
    grades = forms.JSONField(
        label="Grades (JSON format)",
        help_text="Enter grades as a JSON list, e.g., [80, 90, 85].",
    )
    grader = forms.ModelChoiceField(
        queryset=User.objects.filter(
            role__in=["supervisor", "examiner", "course_coordinator"]
        ),
        required=False,
        label="Grader",
        help_text="Optionally assign a grader to the selected grades.",
    )


class GradeAdminForm(forms.ModelForm):
    grades = forms.CharField(
        label="Grades",
        help_text="Enter grades as a comma-separated list (e.g., 80,90,85)",
        required=False,
    )

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)
        if self.request:
            course_filter, is_coordinator = get_coordinator_course_filter(self.request)
            if is_coordinator and course_filter:
                self.fields["student"].queryset = Student.objects.filter(course_filter)

    class Meta:
        model = Grade
        fields = "__all__"

    def clean_grades(self):
        grades_input = self.cleaned_data.get("grades")
        if grades_input:
            try:
                grades_list = [int(g) for g in grades_input.split(",") if g.strip()]
                return grades_list
            except (ValueError, TypeError):
                raise forms.ValidationError(
                    "Invalid grades format. Use comma-separated numbers (e.g., 80,90,85)."
                )
        return []
