from import_export import resources
from .models import Announcement


class AnnouncementResource(resources.ModelResource):
    class Meta:
        model = Announcement
        fields = (
            "id",
            "title",
            "message",
            "src",
            "course",
        )
        export_order = fields
