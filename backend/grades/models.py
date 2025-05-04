from django.db import models
from users.models import Student, User
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete


class MarkingScheme(models.Model):
    label = models.CharField(max_length=255)
    marks = models.FloatField()
    weightage = models.FloatField()
    pic = models.CharField(
        max_length=50,
        choices=[
            ("supervisor", "Supervisor"),
            ("examiner", "Examiner"),
            ("coordinator", "Coordinator"),
        ],
    )
    contents = models.JSONField()
    course = models.CharField(
        max_length=5,
        choices=[
            ("FYP1", "FYP1"),
            ("FYP2", "FYP2"),
        ],
        default="FYP1",
    )

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


class TotalMarks(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="total_marks"
    )
    course = models.CharField(
        max_length=5,
        choices=[
            ("FYP1", "FYP1"),
            ("FYP2", "FYP2"),
        ],
    )
    total_mark = models.FloatField(default=0.0)
    breakdown = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} - {self.course} - {self.total_mark}"


@receiver([post_save, post_delete], sender=Grade)
def update_total_marks(sender, instance, **kwargs):
    student = instance.student
    course = student.course
    total_mark = 0.0
    breakdown = {}
    schemes = MarkingScheme.objects.filter(course=course)
    for scheme in schemes:
        grades = Grade.objects.filter(student=student, scheme=scheme)
        if grades.exists():
            total_grades = []
            for grade in grades:
                total_grades.extend(grade.grades)
            if total_grades:
                max_marks = scheme.marks
                num_grades = len(total_grades)
                score = (
                    sum(total_grades) / (num_grades * max_marks)
                ) * scheme.weightage
                total_mark += score
                breakdown[scheme.label] = round(
                    score, 2
                )  # Use label instead of scheme_{id}
    TotalMarks.objects.update_or_create(
        student=student,
        course=course,
        defaults={"total_mark": round(total_mark, 2), "breakdown": breakdown},
    )
