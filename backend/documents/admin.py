from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from django.utils.html import format_html
import zipfile
from io import BytesIO
from users.models import CourseCoordinator
from users.utils import get_coordinator_course_filter
from .models import Document, Logbook, StudentSubmission, Feedback


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "upload_date",
        "get_mode",
        "course",
        "file_link",
        "thumbnail_preview",
    )
    search_fields = ("title",)
    list_filter = ("category", "mode", "course")
    readonly_fields = ("upload_date", "thumbnail")
    date_hierarchy = "upload_date"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            queryset = queryset.filter(course_filter)
        return queryset

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
    list_display = ("id", "student", "submission_phase", "upload_date", "download_file")
    list_filter = ("submission_phase",)
    search_fields = ("student__user__name", "submission_phase__title")
    date_hierarchy = "upload_date"
    readonly_fields = ("upload_date", "file")
    actions = ["download_selected_files"]

    fieldsets = (
        (None, {"fields": ("student", "submission_phase", "file")}),
        ("Metadata", {"fields": ("upload_date",), "classes": ("collapse",)}),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<path:object_id>/download/",
                self.admin_site.admin_view(self.download_file_view),
                name="studentsubmission-download-file",
            ),
        ]
        return custom_urls + urls

    def download_file(self, obj):
        """Display a download link for the file in the list view."""
        if obj.file:
            return format_html(
                '<a href="{}" download>Download</a>',
                obj.file.url,
            )
        return "-"

    download_file.short_description = "File"

    def download_file_view(self, request, object_id):
        """Handle individual file download."""
        submission = self.get_object(request, object_id)
        if not submission or not submission.file:
            return HttpResponse("File not found.", status=404)

        file = submission.file
        response = HttpResponse(file, content_type="application/octet-stream")
        response["Content-Disposition"] = f'attachment; filename="{file.name}"'
        return response

    def download_selected_files(self, request, queryset):
        """Action to download selected files as a ZIP archive."""
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for submission in queryset:
                if submission.file:
                    file_path = submission.file.path
                    # Use a unique filename to avoid conflicts
                    filename = f"{submission.student.user.name}_{submission.submission_phase.title}_{submission.file.name.split('/')[-1]}"
                    zip_file.write(file_path, filename)

        zip_buffer.seek(0)
        response = HttpResponse(
            zip_buffer.getvalue(), content_type="application/x-zip-compressed"
        )
        response["Content-Disposition"] = 'attachment; filename="submissions.zip"'
        return response

    download_selected_files.short_description = "Download selected files as ZIP"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator = CourseCoordinator.objects.get(user=request.user)
            if coordinator.course != "Both":
                queryset = queryset.filter(student__course=coordinator.course)
        return queryset

    def has_add_permission(self, request):
        return False


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "supervisor", "submission", "upload_date")
    list_filter = ("supervisor",)
    search_fields = ("supervisor__name", "submission__id")
    date_hierarchy = "upload_date"
    readonly_fields = ("supervisor", "submission", "file", "comment", "upload_date")
    fieldsets = ((None, {"fields": ("supervisor", "submission", "file", "comment")}),)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            # Get the coordinator's course directly
            coordinator = CourseCoordinator.objects.get(user=request.user)
            if coordinator.course != "Both":
                queryset = queryset.filter(
                    submission__student__course=coordinator.course
                )
        return queryset

    def has_add_permission(self, request):
        return False


@admin.register(Logbook)
class LogbookAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student_name",
        "supervisor_name",
        "date",
        "status",
    )
    list_filter = ("status", "supervisor", "student")
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

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            # Get the coordinator's course directly
            coordinator = CourseCoordinator.objects.get(user=request.user)
            if coordinator.course != "Both":
                queryset = queryset.filter(student__course=coordinator.course)
        return queryset

    def student_name(self, obj):
        return obj.student.user.name

    student_name.short_description = "Student"

    def supervisor_name(self, obj):
        return obj.supervisor.name

    supervisor_name.short_description = "Supervisor"

    def has_add_permission(self, request):
        return False
