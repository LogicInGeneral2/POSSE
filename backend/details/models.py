from django.db import models
from django.utils import timezone


class Announcement(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    src = models.FileField(upload_to="announcements/", null=True, blank=True)

    def __str__(self):
        return self.title


class Outline(models.Model):
    label = models.CharField(max_length=255)
    src = models.FileField(upload_to="outlines/", null=True, blank=True)

    def __str__(self):
        return self.label


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
