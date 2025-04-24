from django import forms
from users.models import User
from .models import Grade


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
