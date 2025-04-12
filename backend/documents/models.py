from io import BytesIO
from django.db import models
from django.core.files.base import ContentFile
import os
import fitz


def pdf_thumbnail_upload_path(instance, filename):
    return f"thumbnails/{instance.title}_thumb.jpg"


def document_upload_path(instance, filename):
    return f"documents/{filename}"


def submission_upload_path(instance, filename):
    return f"submissions/student_{instance.student.id}/{filename}"


def feedback_upload_path(instance, filename):
    return f"feedbacks/submission_{instance.submission.id}/{filename}"


class Document(models.Model):
    CATEGORY_CHOICES = [
        ("Lecture Notes", "Lecture Notes"),
        ("Samples", "Samples"),
        ("Templates", "Templates"),
    ]
    title = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to=document_upload_path)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    thumbnail = models.ImageField(
        upload_to=pdf_thumbnail_upload_path, blank=True, null=True
    )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Generate thumbnail if PDF and no thumbnail set
        if self.file and self.file.name.endswith(".pdf") and not self.thumbnail:
            try:
                doc = fitz.open(self.file.path)
                page = doc.load_page(0)  # first page
                pix = page.get_pixmap()
                buffer = BytesIO(pix.tobytes("png"))

                thumb_name = (
                    os.path.splitext(os.path.basename(self.file.name))[0] + "_thumb.png"
                )
                self.thumbnail.save(thumb_name, ContentFile(buffer.read()), save=False)
                super().save(update_fields=["thumbnail"])

            except Exception as e:
                print("Thumbnail generation failed:", e)

    def __str__(self):
        return self.title


class StudentSubmission(models.Model):
    student = models.ForeignKey("users.Student", on_delete=models.CASCADE)
    submission_phase = models.ForeignKey(
        "details.Submissions", on_delete=models.CASCADE
    )
    file = models.FileField(upload_to=submission_upload_path)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.name} - {self.submission_phase.title}"


class Feedback(models.Model):
    supervisor = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, limit_choices_to={"role": "supervisor"}
    )
    submission = models.ForeignKey(StudentSubmission, on_delete=models.CASCADE)
    file = models.FileField(upload_to=feedback_upload_path)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.supervisor.name} for {self.submission}"


class Logbook(models.Model):
    CATEGORY_CHOICES = [
        ("sent", "Sent"),
        ("approved", "Approved"),
    ]
    student = models.ForeignKey("users.Student", on_delete=models.CASCADE)
    supervisor = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, limit_choices_to={"role": "supervisor"}
    )
    date = models.DateField()
    activities = models.TextField()
    feedbacks = models.TextField()
    plan = models.TextField()
    status = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="sent")

    def __str__(self):
        return f"Logbook for {self.student.user.name} on {self.date}"
