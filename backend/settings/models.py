from django.db import models
from django.core.validators import RegexValidator


class Outline(models.Model):
    label = models.CharField(max_length=255)
    src = models.FileField(upload_to="outlines/", null=True, blank=True)

    def __str__(self):
        return self.label


HEX_COLOR_VALIDATOR = RegexValidator(
    regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
    message="Enter a valid hex color code (e.g. #FFF or #FFFFFF).",
)


class documentModes(models.Model):
    label = models.CharField(max_length=255)
    visibility = models.BooleanField(default=True)

    def __str__(self):
        return str(self.label)


class submissionStatusTheme(models.Model):
    primary = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    secondary = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    label = models.CharField(max_length=255)

    def __str__(self):
        return str(self.label)


class systemTheme(models.Model):
    main = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    label = models.CharField(max_length=255)

    def __str__(self):
        return str(self.label)
