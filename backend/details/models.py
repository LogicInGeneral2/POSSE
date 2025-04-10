from django.db import models
from django.utils import timezone


class Announcement(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    src = models.FileField(upload_to="announcements/", null=True, blank=True)

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

    title = models.CharField(max_length=255)
    description = models.TextField()
    directory = models.CharField(max_length=20, choices=DIRECTORY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()

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


class Submissions(models.Model):
    title = models.CharField(max_length=255)
    date_open = models.DateField()
    date_close = models.DateField()
    description = models.TextField()

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
