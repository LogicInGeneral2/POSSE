from django.contrib import admin

from .resources import AnnouncementResource, PeriodResource, SubmissionsResource
from .models import Announcement, Period, Submissions
from django import forms
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin


# Announcement Admin
@admin.register(Announcement)
class AnnouncementAdmin(ImportExportModelAdmin):
    resource_class = AnnouncementResource
    list_display = ["title", "short_message", "src_link"]
    search_fields = ["title", "message"]
    list_per_page = 20

    def short_message(self, obj):
        # Return a shortened version of the message, up to 50 characters.
        return obj.message[:50] + ("..." if len(obj.message) > 50 else "")

    short_message.short_description = "Message"

    def src_link(self, obj):
        if obj.src:
            return format_html(
                "<a href='{}' target='_blank'>View File</a>", obj.src.url
            )
        return "-"

    src_link.short_description = "File"


# Period Admin Form with overlap checking and validation
class PeriodAdminForm(forms.ModelForm):
    class Meta:
        model = Period
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get("start_date")
        end = cleaned_data.get("end_date")

        if start and end and start > end:
            raise ValidationError("Start date cannot be after end date.")

        # Check for overlapping periods
        overlapping = Period.objects.exclude(pk=self.instance.pk).filter(
            start_date__lte=end, end_date__gte=start
        )
        if overlapping.exists():
            raise ValidationError("This period overlaps with an existing period.")

        return cleaned_data


@admin.register(Period)
class PeriodAdmin(ImportExportModelAdmin):
    resource_class = PeriodResource
    form = PeriodAdminForm
    list_display = ["title", "directory", "start_date", "end_date", "days_left"]
    search_fields = ["title", "directory"]
    list_filter = ["directory"]

    def days_left(self, obj):
        return obj.days_left()


@admin.register(Submissions)
class SubmissionsAdmin(ImportExportModelAdmin):
    resource_class = SubmissionsResource
    list_display = ("title", "date_open", "date_close", "days_left_colored")
    search_fields = ("title",)
    list_filter = ("date_open", "date_close")
    date_hierarchy = "date_open"
    readonly_fields = ("days_left",)

    fieldsets = (
        (None, {"fields": ("title", "description")}),
        ("Submission Window", {"fields": ("date_open", "date_close", "days_left")}),
    )

    def days_left_colored(self, obj):
        days = obj.days_left()
        color = "green" if days > 3 else "orange" if days > 0 else "red"
        return format_html(f"<span style='color:{color}'>{days} days</span>")

    days_left_colored.short_description = "Days Left"
