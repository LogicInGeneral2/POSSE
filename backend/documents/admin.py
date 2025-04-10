from django.contrib import admin
from .models import Document, StudentSubmission, Feedback


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "upload_date",
        "file_link",
        "thumbnail_preview",
    )
    search_fields = ("title", "category")
    list_filter = ("category",)
    readonly_fields = ("upload_date", "thumbnail")
    date_hierarchy = "upload_date"

    def file_link(self, obj):
        return obj.file.url if obj.file else "-"

    file_link.short_description = "File"

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return f"<img src='{obj.thumbnail.url}' width='50' height='70'/>"
        return "-"

    thumbnail_preview.allow_tags = True
    thumbnail_preview.short_description = "Thumbnail"


@admin.register(StudentSubmission)
class StudentSubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "submission_phase", "upload_date")
    list_filter = ("submission_phase",)
    search_fields = ("student__user__name", "submission_phase__title")
    date_hierarchy = "upload_date"
    readonly_fields = ("upload_date", "file")

    fieldsets = (
        (None, {"fields": ("student", "submission_phase", "file")}),
        ("Metadata", {"fields": ("upload_date",), "classes": ("collapse",)}),
    )


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "supervisor", "submission", "upload_date")
    list_filter = ("supervisor",)
    search_fields = ("supervisor__name", "submission__id")
    date_hierarchy = "upload_date"

    fieldsets = (
        (None, {"fields": ("supervisor", "submission", "file")}),
        ("Timestamps", {"fields": ("upload_date",), "classes": ("collapse",)}),
    )
