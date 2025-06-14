from django import forms
from .models import StudentMark, Student, Criteria


class StudentMarkAdminForm(forms.ModelForm):
    class Meta:
        model = StudentMark
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Customize the student field to show course and mode
        if self.fields.get("student"):
            self.fields["student"].queryset = Student.objects.select_related(
                "user"
            ).all()
            self.fields["student"].label_from_instance = self.label_from_student

        # Customize the criteria field to show rubric
        if self.fields.get("criteria"):
            self.fields["criteria"].queryset = Criteria.objects.select_related(
                "rubric",
            ).all()
            self.fields["criteria"].label_from_instance = self.label_from_criteria

        # Customize the mark field to show max_mark in help_text
        if self.instance and self.instance.criteria_id:
            max_mark = self.instance.criteria.max_mark
            self.fields["mark"].help_text = f"Enter a mark between 0 and {max_mark}."

    def label_from_student(self, obj):
        return f"{obj.user.name} ({obj.course}, {obj.mode.capitalize()})"

    def label_from_criteria(self, obj):
        return f"{obj.label} ({obj.rubric.label})"

    def clean(self):
        cleaned_data = super().clean()
        mark = cleaned_data.get("mark")
        criteria = cleaned_data.get("criteria")
        if mark is not None and criteria:
            if mark < 0 or mark > criteria.max_mark:
                raise forms.ValidationError(
                    f"Mark must be between 0 and {criteria.max_mark}."
                )
            if mark == 0:
                raise forms.ValidationError("Mark cannot be 0.")
        return cleaned_data
