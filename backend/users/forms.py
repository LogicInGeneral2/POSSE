# users/forms.py
from django import forms
from .models import Student, User, CourseCoordinator
from .utils import get_coordinator_course_filter
from django.contrib.auth.forms import UserCreationForm


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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the label for the examiners checkboxes
        self.fields["examiners"].label_from_instance = (
            lambda obj: f"{obj.name} ({obj.get_role_display()})"
        )


class SupervisorSelectionForm(forms.Form):
    supervisor = forms.ModelChoiceField(
        queryset=User.objects.filter(role="supervisor"),  # adjust filter as needed
        required=True,
        label="Select Supervisor",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the label for the supervisor dropdown
        self.fields["supervisor"].label_from_instance = (
            lambda obj: f"{obj.name} ({obj.get_role_display()})"
        )


class CustomUserCreationForm(UserCreationForm):
    course = forms.ChoiceField(
        choices=CourseCoordinator.COURSE_CHOICES,
        required=False,
        label="Course (for Course Coordinators)",
        help_text="Required for users with role 'course_coordinator'.",
    )

    class Meta:
        model = User
        fields = ("email", "name", "role", "course", "password1", "password2")

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)
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
            self.add_error("course", "Course is required for course coordinators.")
        return cleaned_data


class StudentAdminForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the supervisor field
        self.fields["supervisor"].queryset = User.objects.filter(
            role="supervisor", is_active=True
        ).order_by("name")
        self.fields["supervisor"].label_from_instance = (
            lambda obj: f"{obj.name} ({obj.get_role_display()})"
        )

        # Customize the evaluators field
        self.fields["evaluators"].queryset = User.objects.filter(
            is_examiner=True, is_active=True
        ).order_by("name")
        self.fields["evaluators"].label_from_instance = (
            lambda obj: f"{obj.name} ({obj.get_role_display()})"
        )
