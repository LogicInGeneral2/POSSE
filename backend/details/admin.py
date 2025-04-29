from django.contrib import admin
from users.models import CourseCoordinator
from .forms import PeriodAdminForm
from .resources import AnnouncementResource, PeriodResource, SubmissionsResource
from .models import Announcement, Period, Submissions
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin
from django.urls import reverse
from django.http import HttpResponseRedirect
from users.utils import get_coordinator_course_filter
from django.contrib import messages


@admin.register(Announcement)
class AnnouncementAdmin(ImportExportModelAdmin):
    resource_class = AnnouncementResource
    list_display = ["title", "short_message", "src_link", "course"]
    search_fields = ["title", "message", "course"]
    list_per_page = 20
    list_filter = ["course"]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            return qs.filter(course_filter)
        return qs

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit announcements for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete announcements for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete announcements for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)

    def short_message(self, obj):
        return obj.message[:50] + ("..." if len(obj.message) > 50 else "")

    short_message.short_description = "Message"

    def src_link(self, obj):
        if obj.src:
            return format_html(
                "<a href='{}' target='_blank'>View File</a>", obj.src.url
            )
        return "-"

    src_link.short_description = "File"


@admin.register(Period)
class PeriodAdmin(ImportExportModelAdmin):
    resource_class = PeriodResource
    form = PeriodAdminForm
    list_display = [
        "title",
        "directory",
        "start_date",
        "end_date",
        "days_left",
        "course",
    ]
    search_fields = ["title", "directory", "course"]
    list_filter = ["directory", "course"]

    def get_form(self, request, obj=None, **kwargs):
        kwargs["form"] = PeriodAdminForm
        kwargs["form"].request = request  # Pass request to form
        return super().get_form(request, obj, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            return qs.filter(course_filter)
        return qs

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit periods for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete periods for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete periods for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)

    def days_left(self, obj):
        return obj.days_left()

    def create_submission_from_period(self, request, queryset):
        if queryset.count() == 0:
            self.message_user(
                request, "Please select at least one period.", level="ERROR"
            )
            return
        created_submissions = []
        for period in queryset:
            submission = Submissions.objects.create(
                title=period.title,
                description=period.description,
                date_open=period.start_date,
                date_close=period.end_date,
                course=period.course,
            )
            created_submissions.append(submission.title)
        self.message_user(
            request,
            f"Successfully created {len(created_submissions)} submission(s): {', '.join(created_submissions)}",
            level="SUCCESS",
        )
        return HttpResponseRedirect(reverse("admin:details_period_changelist"))

    create_submission_from_period.short_description = (
        "Create submissions from selected periods"
    )


@admin.register(Submissions)
class SubmissionsAdmin(ImportExportModelAdmin):
    resource_class = SubmissionsResource
    list_display = ("title", "date_open", "date_close", "days_left_colored", "course")
    search_fields = ("title", "course")
    list_filter = ("date_open", "date_close", "course")
    date_hierarchy = "date_open"
    readonly_fields = ("days_left",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            return qs.filter(course_filter)
        return qs

    def save_model(self, request, obj, form, change):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only create/edit submissions for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            if obj.course != coordinator_course and obj.course != "Both":
                self.message_user(
                    request,
                    f"You can only delete submissions for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        course_filter, is_coordinator = get_coordinator_course_filter(request)
        if is_coordinator and course_filter:
            coordinator_course = CourseCoordinator.objects.get(user=request.user).course
            restricted = queryset.exclude(course=coordinator_course).exclude(
                course="Both"
            )
            if restricted.exists():
                self.message_user(
                    request,
                    f"You can only delete submissions for {coordinator_course}.",
                    messages.ERROR,
                )
                return
        super().delete_queryset(request, queryset)

    def days_left_colored(self, obj):
        days = obj.days_left()
        color = "green" if days > 3 else "orange" if days > 0 else "red"
        return format_html(f"<span style='color:{color}'>{days} days</span>")

    days_left_colored.short_description = "Days Left"

    fieldsets = (
        (None, {"fields": ("title", "description", "course")}),
        ("Submission Window", {"fields": ("date_open", "date_close", "days_left")}),
    )
