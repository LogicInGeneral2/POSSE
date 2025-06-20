from django.conf import settings
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db.models import Q


def upload_to_supervisor_requests(instance, filename):
    return f"supervisor_requests/student_{instance.student.id}/{filename}"


class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, role, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(
        self, email, name, role="course_coordinator", password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_examiner", True)
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
    is_examiner = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "name", "role"]

    def save(self, *args, **kwargs):
        # Enforce is_examiner and is_available for students
        if self.role == "student":
            self.is_examiner = False
            self.is_available = False
        if self.role not in ["supervisor", "examiner"]:
            self.is_examiner = False
            self.is_available = False
        # Enforce is_staff for course_coordinator
        if self.role == "course_coordinator":
            self.is_staff = True
        # Auto-generate or update username based on email
        if self.email:
            # Check if the email has changed or username is not set
            if not self.username or (
                self.pk and self.email != User.objects.get(pk=self.pk).email
            ):
                base_username = self.email.split("@")[0]
                unique_username = base_username
                counter = 1
                # Exclude current user from username uniqueness check
                while (
                    User.objects.filter(username=unique_username)
                    .exclude(pk=self.pk)
                    .exists()
                ):
                    unique_username = f"{base_username}{counter}"
                    counter += 1
                self.username = unique_username
        super().save(*args, **kwargs)

        def __str__(self):
            return f"{self.name} ({self.get_role_display()})"


class CourseCoordinator(models.Model):
    COURSE_CHOICES = [
        ("FYP1", "FYP1"),
        ("FYP2", "FYP2"),
        ("Both", "Both"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to=~Q(role="student"),
        related_name="course_coordinator_profile",
    )
    course = models.CharField(max_length=10, choices=COURSE_CHOICES, default="FYP1")

    def __str__(self):
        return f"{self.user.name} ({self.course})"

    def save(self, *args, **kwargs):
        # Ensure the associated user is a course coordinator
        if self.user.role not in ["course_coordinator", "supervisor"]:
            raise ValueError("User must have role 'course_coordinator'.")
        super().save(*args, **kwargs)


class Student(models.Model):
    COURSE_CHOICES = [("FYP1", "FYP1"), ("FYP2", "FYP2"), ("inactive", "Inactive")]
    MODE_CHOICES = [("research", "research"), ("development", "development")]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, limit_choices_to={"role": "student"}
    )
    student_id = models.CharField(max_length=10, null=False, blank=False, unique=True)
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
        limit_choices_to={"is_examiner": True},
    )

    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="development")
    topic = models.CharField(max_length=255, null=True, blank=True)
    cgpa = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.name} ({self.course})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class SupervisorsRequest(models.Model):
    MODE_CHOICES = [("research", "Research"), ("development", "Development")]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="supervisor_requests",
        limit_choices_to={"role": "student"},
        unique=True,  # Ensure one entry per student
    )
    # First choice
    first_id = models.PositiveIntegerField(null=True, blank=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    first_proof = models.FileField(
        upload_to=upload_to_supervisor_requests,
        null=True,
        blank=True,
        help_text="Proof of first choice request (image or PDF)",
    )
    # Second choice
    second_id = models.PositiveIntegerField(null=True, blank=True)
    second_name = models.CharField(max_length=255, null=True, blank=True)
    second_proof = models.FileField(
        upload_to=upload_to_supervisor_requests,
        null=True,
        blank=True,
        help_text="Proof of second choice request (image or PDF)",
    )
    # Third choice
    third_id = models.PositiveIntegerField(null=True, blank=True)
    third_name = models.CharField(max_length=255, null=True, blank=True)
    third_proof = models.FileField(
        upload_to=upload_to_supervisor_requests,
        null=True,
        blank=True,
        help_text="Proof of third choice request (image or PDF)",
    )
    # Shared fields
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="development")
    topic = models.CharField(max_length=255, null=True, blank=True)
    cgpa = models.FloatField(default=0.0)

    class Meta:
        ordering = ["student"]

    def __str__(self):
        return f"Supervisor Request for {self.student}"
