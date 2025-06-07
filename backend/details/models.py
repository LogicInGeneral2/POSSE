from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Q


class Announcement(models.Model):
    COURSE_CHOICES = [
        ("FYP1", "FYP1"),
        ("FYP2", "FYP2"),
        ("Both", "Both"),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    src = models.FileField(upload_to="announcements/", null=True, blank=True)
    course = models.CharField(max_length=5, choices=COURSE_CHOICES, default="Both")

    def __str__(self):
        return self.title


class Period(models.Model):
    DIRECTORY_CHOICES = [
        ("supervisors", "Supervisors"),
        ("submissions", "Submissions"),
        ("logs", "Logs"),
        ("course_outline", "Course Outline"),
        ("home", "Home"),
        ("documents", "Documents"),
    ]
    COURSE_CHOICES = [
        ("FYP1", "FYP1"),
        ("FYP2", "FYP2"),
        ("Both", "Both"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    directory = models.CharField(
        max_length=20, choices=DIRECTORY_CHOICES, null=True, blank=True
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_selection_period = models.BooleanField(default=False)
    course = models.CharField(max_length=5, choices=COURSE_CHOICES, default="Both")

    def __str__(self):
        return self.title

    def is_current(self):
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date

    def days_left(self):
        today = timezone.now().date()
        if self.end_date >= today:
            return (self.end_date - today).days
        return 0

    def clean(self):
        super().clean()
        # Validate that start_date is not after end_date
        if self.start_date > self.end_date:
            raise ValidationError("Start date cannot be after end date.")
        # Check for overlapping periods for the same course
        overlapping = Period.objects.filter(
            Q(start_date__lte=self.end_date, end_date__gte=self.start_date),
            course=self.course,
        ).exclude(id=self.id)  # Exclude self when updating
        if overlapping.exists():
            raise ValidationError(
                f"A period with overlapping dates ({self.start_date} to {self.end_date}) for course {self.course} already exists."
            )

    class Meta:
        unique_together = ("start_date", "end_date", "course")
        ordering = ["start_date"]


class Submissions(models.Model):
    COURSE_CHOICES = [
        ("FYP1", "FYP1"),
        ("FYP2", "FYP2"),
        ("Both", "Both"),
    ]

    title = models.CharField(max_length=255)
    date_open = models.DateField()
    date_close = models.DateField()
    description = models.TextField()
    course = models.CharField(max_length=5, choices=COURSE_CHOICES, default="Both")

    def __str__(self):
        return self.title

    def days_left(self):
        today = timezone.now().date()
        if self.date_close:
            if self.date_close >= today:
                return (self.date_close - today).days
        return 0

    def get_dynamic_status(self, student):
        today = timezone.now().date()
        days_left = self.days_left()

        student_submission = self.studentsubmission_set.filter(student=student).first()
        if not student_submission:
            if today < self.date_open:
                return "Upcoming"
            elif days_left > 0:
                return "Pending"
            else:
                return "Missed"
        else:
            feedback = student_submission.feedback_set.first()
            if feedback:
                return "Feedback"
            elif days_left == 0:
                return "Closed"
            else:
                return "Completed"

    def clean(self):
        super().clean()
        # Validate that date_open is not after date_close
        if self.date_open > self.date_close:
            raise ValidationError("Open date cannot be after close date.")
        # Check for overlapping submissions for the same course
        overlapping = Submissions.objects.filter(
            Q(date_open__lte=self.date_close, date_close__gte=self.date_open),
            course=self.course,
        ).exclude(id=self.id)  # Exclude self when updating
        if overlapping.exists():
            raise ValidationError(
                f"A submission with overlapping dates ({self.date_open} to {self.date_close}) for course {self.course} already exists."
            )

    class Meta:
        unique_together = ("date_open", "date_close", "course")
        ordering = ["date_open"]
