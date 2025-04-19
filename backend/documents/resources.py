from import_export import resources, fields
from .models import Document


class DocumentResource(resources.ModelResource):
    category_label = fields.Field(column_name="category", attribute="category__label")
    mode_label = fields.Field(column_name="mode", attribute="mode__label")

    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "upload_date",
            "file",
            "category_label",
            "thumbnail",
            "mode_label",
        )
        export_order = fields
