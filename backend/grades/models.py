from django.db import models

from users.models import Student, User


class MarkingScheme(models.Model):
    label = models.CharField(max_length=255)
    marks = models.FloatField()
    weightage = models.FloatField()
    pic = models.CharField(max_length=50)  # e.g., "supervisor" or "evaluator"
    contents = models.JSONField()  # List of content items, e.g., ["Log Book", ...]

    def __str__(self):
        return self.label


class Grade(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="grades"
    )
    scheme = models.ForeignKey(
        MarkingScheme, on_delete=models.CASCADE, related_name="grades"
    )
    grader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="assigned_grades",
        limit_choices_to={"role__in": ["supervisor", "examiner", "course_coordinator"]},
    )
    grades = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "student",
            "scheme",
            "grader",
        )

    def __str__(self):
        return f"{self.student} - {self.scheme} ({self.grader})"
