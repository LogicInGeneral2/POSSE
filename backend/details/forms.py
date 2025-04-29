from django import forms
from django.core.exceptions import ValidationError
from users.models import CourseCoordinator
from .models import Period
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
        start = cleaned_data.get("start_date")
        end = cleaned_data.get("end_date")
        create_submission = cleaned_data.get("create_submission")
        submission_title = cleaned_data.get("submission_title")
        submission_description = cleaned_data.get("submission_description")

        if start and end and start > end:
            raise ValidationError("Start date cannot be after end date.")

        overlapping = Period.objects.exclude(pk=self.instance.pk).filter(
            start_date__lte=end, end_date__gte=start, course=cleaned_data.get("course")
        )
        if overlapping.exists():
            raise ValidationError(
                "This period overlaps with an existing period for the same course."
            )

        if create_submission:
            if not submission_title:
                raise ValidationError(
                    "Submission title is required when creating a submission."
                )
            if not submission_description:
                raise ValidationError(
                    "Submission description is required when creating a submission."
                )

        return cleaned_data
