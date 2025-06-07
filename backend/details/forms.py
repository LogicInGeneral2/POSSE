from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q
from users.models import CourseCoordinator
from .models import Period, Submissions
from users.utils import get_coordinator_course_filter


class PeriodAdminForm(forms.ModelForm):
    create_submission = forms.BooleanField(
        required=False, label="Create corresponding submission"
    )
    submission_title = forms.CharField(
        max_length=255, required=False, label="Submission Title"
    )
    submission_description = forms.CharField(
        widget=forms.Textarea, required=False, label="Submission Description"
    )

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)
        if self.request:
            course_filter, is_coordinator = get_coordinator_course_filter(self.request)
            if is_coordinator and course_filter:
                coordinator_course = CourseCoordinator.objects.get(
                    user=self.request.user
                ).course
                self.fields["course"].choices = [
                    (coordinator_course, coordinator_course),
                    ("Both", "Both"),  # Allow "Both" as an option
                ]

    class Meta:
        model = Period
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get("start_date")
        end_date = cleaned_data.get("end_date")
        course = cleaned_data.get("course")
        create_submission = cleaned_data.get("create_submission")
        submission_title = cleaned_data.get("submission_title")
        submission_description = cleaned_data.get("submission_description")

        # Validate start_date <= end_date
        if start_date and end_date and start_date > end_date:
            raise ValidationError("Start date cannot be after end date.")

        # Check for overlapping periods for the same course
        if start_date and end_date and course:
            overlapping = Period.objects.filter(
                Q(start_date__lte=end_date, end_date__gte=start_date),
                course=course,
            ).exclude(pk=self.instance.pk)
            if overlapping.exists():
                raise ValidationError(
                    f"A period with overlapping dates ({start_date} to {end_date}) for course {course} already exists."
                )

        # Validate submission fields if create_submission is checked
        if create_submission:
            if not submission_title:
                raise ValidationError(
                    "Submission title is required when creating a submission."
                )
            if not submission_description:
                raise ValidationError(
                    "Submission description is required when creating a submission."
                )
            # Check for overlapping submissions when creating a submission
            if start_date and end_date and course:
                overlapping_submissions = Submissions.objects.filter(
                    Q(date_open__lte=end_date, date_close__gte=start_date),
                    course=course,
                )
                if overlapping_submissions.exists():
                    raise ValidationError(
                        f"A submission with overlapping dates ({start_date} to {end_date}) for course {course} already exists."
                    )

        return cleaned_data


class SubmissionsAdminForm(forms.ModelForm):
    class Meta:
        model = Submissions
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)
        if self.request:
            course_filter, is_coordinator = get_coordinator_course_filter(self.request)
            if is_coordinator and course_filter:
                coordinator_course = CourseCoordinator.objects.get(
                    user=self.request.user
                ).course
                self.fields["course"].choices = [
                    (coordinator_course, coordinator_course),
                    ("Both", "Both"),  # Allow "Both" as an option
                ]

    def clean(self):
        cleaned_data = super().clean()
        date_open = cleaned_data.get("date_open")
        date_close = cleaned_data.get("date_close")
        course = cleaned_data.get("course")

        # Validate date_open <= date_close
        if date_open and date_close and date_open > date_close:
            raise ValidationError("Open date cannot be after close date.")

        # Check for overlapping submissions for the same course
        if date_open and date_close and course:
            overlapping = Submissions.objects.filter(
                Q(date_open__lte=date_close, date_close__gte=date_open),
                course=course,
            ).exclude(pk=self.instance.pk)
            if overlapping.exists():
                raise ValidationError(
                    f"A submission with overlapping dates ({date_open} to {date_close}) for course {course} already exists."
                )

        return cleaned_data
