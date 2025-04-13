from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .resources import MarkingSchemeResource
from .models import MarkingScheme, Grade


@admin.register(MarkingScheme)
class MarkingSchemeAdmin(ImportExportModelAdmin):
    resource_class = MarkingSchemeResource
    list_display = ["label", "marks", "weightage", "pic"]
    list_filter = ["pic"]
    search_fields = ["label", "contents"]


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["student", "scheme", "grader", "created_at", "updated_at"]
    list_filter = ["scheme__pic", "grader__role", "student__course"]
    search_fields = ["student__user__name", "grader__name", "scheme__label"]
    raw_id_fields = ["student", "grader"]  # For better performance with large datasets

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("student__user", "grader", "scheme")
        )
