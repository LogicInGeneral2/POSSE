# users/forms.py
from django import forms
from .models import User, CourseCoordinator
from .utils import get_coordinator_course_filter


class CustomUserChangeForm(forms.ModelForm):
    course = forms.ChoiceField(
        choices=CourseCoordinator.COURSE_CHOICES,
        required=False,
        label="Course (for Course Coordinators)",
        help_text="Required for users with role 'course_coordinator'.",
    )

    class Meta:
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.role == "student":
            self.fields["is_examiner"].disabled = True
            self.fields["is_available"].disabled = True
        if self.instance and self.instance.role == "course_coordinator":
            self.fields["is_staff"].disabled = True
            try:
                coordinator = CourseCoordinator.objects.get(user=self.instance)
                self.fields["course"].initial = coordinator.course
            except CourseCoordinator.DoesNotExist:
                pass
        # Restrict course choices based on current user's course
        if self.request:
            course_filter, is_coordinator = get_coordinator_course_filter(self.request)
            if is_coordinator and course_filter:
                coordinator_course = CourseCoordinator.objects.get(
                    user=self.request.user
                ).course
                self.fields["course"].choices = [
                    (coordinator_course, coordinator_course)
                ]

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get("role")
        course = cleaned_data.get("course")
        if role == "course_coordinator" and not course:
            raise forms.ValidationError(
                "Course is required for users with role 'course_coordinator'."
            )
        return cleaned_data

    def clean_password(self):
        return self.initial.get("password")


class ExaminerSelectionForm(forms.Form):
    examiners = forms.ModelMultipleChoiceField(
        queryset=User.objects.filter(is_examiner=True),
        label="Select Examiner(s)",
        required=True,
        widget=forms.CheckboxSelectMultiple,
    )


class SupervisorSelectionForm(forms.Form):
    supervisor = forms.ModelChoiceField(
        queryset=User.objects.filter(role="supervisor"),  # adjust filter as needed
        required=True,
        label="Select Supervisor",
    )
