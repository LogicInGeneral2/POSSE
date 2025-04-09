from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError


class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, role, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)

        # Do NOT pass username here — let it auto-generate in save()
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(
        self, email, name, role="course_coordinator", password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, name, role, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("supervisor", "Supervisor"),
        ("examiner", "Examiner"),
        ("course_coordinator", "Course Coordinator"),
    ]

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, editable=False)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"  # Login with username
    REQUIRED_FIELDS = ["email", "name", "role"]  # Asked when creating superuser

    def save(self, *args, **kwargs):
        if not self.username and self.email:
            base_username = self.email.split("@")[0]
            unique_username = base_username
            counter = 1
            while User.objects.filter(username=unique_username).exists():
                unique_username = f"{base_username}{counter}"
                counter += 1
            self.username = unique_username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


class Student(models.Model):
    COURSE_CHOICES = [("FYP1", "FYP1"), ("FYP2", "FYP2")]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, limit_choices_to={"role": "student"}
    )
    student_id = models.PositiveIntegerField(unique=True)
    course = models.CharField(max_length=10, choices=COURSE_CHOICES)
    supervisor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="supervisees",
        limit_choices_to={"role": "supervisor"},
    )
    evaluators = models.ManyToManyField(
        User,
        blank=True,
        related_name="evaluatees",
        limit_choices_to={"role": "examiner"},
    )

    def clean(self):
        if self.supervisor and self.evaluators.filter(id=self.supervisor.id).exists():
            raise ValidationError("A supervisor cannot also be an evaluator.")

    def __str__(self):
        return f"{self.user.name} ({self.course})"
