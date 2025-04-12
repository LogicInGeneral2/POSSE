from import_export import resources
from .models import Announcement, Period, Submissions


class AnnouncementResource(resources.ModelResource):
    class Meta:
        model = Announcement
        fields = (
            "id",
            "title",
            "message",
            "src",
        )
        export_order = fields


class PeriodResource(resources.ModelResource):
    class Meta:
        model = Period
        fields = (
            "id",
            "title",
            "description",
            "directory",
            "start_date",
            "end_date",
            "is_selection_period",
        )
        export_order = fields


class SubmissionsResource(resources.ModelResource):
    class Meta:
        model = Submissions
        fields = (
            "id",
            "title",
            "date_open",
            "date_close",
            "description",
        )
        export_order = fields
