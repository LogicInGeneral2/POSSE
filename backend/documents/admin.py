from django.contrib import admin
from .resources import DocumentResource
from .models import Document, Logbook, StudentSubmission, Feedback
from import_export.admin import ImportExportModelAdmin
from django.utils.html import format_html


@admin.register(Document)
class DocumentAdmin(ImportExportModelAdmin):
    resource_class = DocumentResource
    list_display = (
        "title",
        "get_category",
        "upload_date",
        "get_mode",
        "file_link",
        "thumbnail_preview",
    )
    search_fields = ("title", "category__label", "mode__label")
    list_filter = ("category", "mode")
    readonly_fields = ("upload_date", "thumbnail")
    date_hierarchy = "upload_date"

    def get_category(self, obj):
        return obj.category.label

    get_category.short_description = "Category"

    def get_mode(self, obj):
        return obj.mode.label

    get_mode.short_description = "Mode"

    def file_link(self, obj):
        if obj.file:
            return format_html("<a href='{}'>{}</a>", obj.file.url, obj.file.url)
        return "-"

    file_link.allow_tags = True
    file_link.short_description = "File"

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html(
                "<img src='{}' width='50' height='70'/>", obj.thumbnail.url
            )
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

    fieldsets = ((None, {"fields": ("supervisor", "submission", "file", "comment")}),)


@admin.register(Logbook)
class LogbookAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student_name",
        "supervisor_name",
        "date",
        "status",
    )
    list_filter = ("status", "date", "supervisor", "student")
    search_fields = (
        "student__user__name",
        "student__user__username",
        "supervisor__name",
        "supervisor__username",
        "activities",
        "feedbacks",
        "plan",
    )
    date_hierarchy = "date"
    ordering = ("-date",)
    readonly_fields = ("date",)

    fieldsets = (
        (
            "Student Info",
            {
                "fields": ("student", "supervisor", "status"),
            },
        ),
        (
            "Logbook Details",
            {
                "fields": ("activities", "feedbacks", "plan", "comment"),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("date",),
                "classes": ("collapse",),
            },
        ),
    )

    def student_name(self, obj):
        return obj.student.user.name

    student_name.short_description = "Student"

    def supervisor_name(self, obj):
        return obj.supervisor.name

    supervisor_name.short_description = "Supervisor"
