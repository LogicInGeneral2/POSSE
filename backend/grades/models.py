from django.db import models
from django.forms import ValidationError
from users.models import Student, User


class Rubric(models.Model):
    label = models.CharField(max_length=255)
    weightage = models.FloatField()
    pic = models.JSONField(default=list)
    course = models.CharField(
        max_length=5,
        choices=[
            ("FYP1", "FYP1"),
            ("FYP2", "FYP2"),
        ],
        default="FYP1",
    )
    steps = models.IntegerField(default=0)

    VALID_ROLES = [
        ("supervisor", "Supervisor"),
        ("examiner", "Examiner"),
        ("course_coordinator", "Course Coordinator"),
    ]
    VALID_ROLE_VALUES = {role[0] for role in VALID_ROLES}

    class Meta:
        ordering = ["steps"]

    def __str__(self):
        return self.label

    def clean(self):
        if not isinstance(self.pic, list):
            raise ValidationError("pic must be a list")
        if not all(role in self.VALID_ROLE_VALUES for role in self.pic):
            raise ValidationError(
                f"Invalid role(s) in pic. Valid roles are: {', '.join(self.VALID_ROLE_VALUES)}"
            )


class Criteria(models.Model):
    label = models.CharField(max_length=255)
    weightage = models.FloatField()
    max_mark = models.FloatField()
    rubric = models.ForeignKey(
        Rubric, on_delete=models.CASCADE, related_name="criterias"
    )
    mode = models.CharField(
        max_length=255,
        choices=[
            ("both", "Both"),
            ("development", "Development"),
            ("research", "Research"),
        ],
        default="both",
    )

    def __str__(self):
        return self.label


class StudentMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE)
    evaluator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    mark = models.FloatField()

    def __str__(self):
        return f"{self.student} - {self.criteria} - {self.mark}"


class Grade(models.Model):
    grade_letter = models.CharField(max_length=5)
    gpa_value = models.FloatField()
    min_mark = models.FloatField()
    max_mark = models.FloatField()

    class Meta:
        ordering = ["-min_mark"]

    def __str__(self):
        return f"{self.grade_letter} ({self.gpa_value})"

    def contains(self, mark: float) -> bool:
        return self.min_mark <= mark <= self.max_mark

    def clean(self):
        if self.min_mark > self.max_mark:
            raise ValidationError(
                "Minimum mark must be less than or equal to maximum mark."
            )


class StudentGrade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    total_mark = models.FloatField()
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically assign grade based on total_mark
        matched_grade = Grade.objects.filter(
            min_mark__lte=self.total_mark, max_mark__gte=self.total_mark
        ).first()
        self.grade = matched_grade
        super().save(*args, **kwargs)

    def __str__(self):
        grade_display = self.grade.grade_letter if self.grade else "N/A"
        return f"{self.student} - Total: {self.total_mark} - Grade: {grade_display}"
