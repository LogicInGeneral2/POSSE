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

    def clean(self):
        self.mark = round(self.mark, 1)
        if self.mark < 0 or self.mark > self.criteria.max_mark:
            raise ValidationError(
                f"Mark must be between 0 and {self.criteria.max_mark}."
            )
        if self.mark == 0:
            raise ValidationError("Mark cannot be 0.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


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

    def recalculate_total_mark(self):
        total_mark = 0
        rubrics = Rubric.objects.filter(course=self.student.course).order_by("steps")
        for rubric in rubrics:
            criteria_list = rubric.criterias.filter(
                mode__in=[self.student.mode, "both"]
            ).order_by("id")
            rubric_score = 0
            for criteria in criteria_list:
                # Group marks by evaluator type
                examiner_marks = StudentMark.objects.filter(
                    student=self.student,
                    criteria=criteria,
                    evaluator__in=self.student.evaluators.all(),
                ).exclude(mark=0)
                supervisor_marks = StudentMark.objects.filter(
                    student=self.student,
                    criteria=criteria,
                    evaluator=self.student.supervisor,
                ).exclude(mark=0)

                # Calculate examiner contribution
                examiner_score = 0
                if examiner_marks.exists() and "examiner" in rubric.pic:
                    avg_examiner_mark = (
                        sum(mark.mark for mark in examiner_marks)
                        / examiner_marks.count()
                    )
                    examiner_score = (
                        avg_examiner_mark / criteria.max_mark * criteria.weightage
                    ) / 100

                # Calculate supervisor contribution
                supervisor_score = 0
                if supervisor_marks.exists() and "supervisor" in rubric.pic:
                    avg_supervisor_mark = (
                        sum(mark.mark for mark in supervisor_marks)
                        / supervisor_marks.count()
                    )
                    supervisor_score = (
                        avg_supervisor_mark / criteria.max_mark * criteria.weightage
                    ) / 100

                # Sum examiner and supervisor scores for the criteria
                criteria_score = examiner_score + supervisor_score
                rubric_score += criteria_score
            # Apply rubric weightage
            total_mark += rubric_score * rubric.weightage
        self.total_mark = round(total_mark, 1)  # Round to 1 decimal place
        # Update or create StudentGrade
        self.grade = Grade.objects.filter(
            min_mark__lte=self.total_mark, max_mark__gte=self.total_mark
        ).first()
        self.save()

    def save(self, *args, **kwargs):
        # Automatically assign grade based on total_mark
        self.grade = Grade.objects.filter(
            min_mark__lte=self.total_mark, max_mark__gte=self.total_mark
        ).first()
        super().save(*args, **kwargs)

    def __str__(self):
        grade_display = self.grade.grade_letter if self.grade else "N/A"
        return f"{self.student} - Total: {self.total_mark} - Grade: {grade_display}"
