from import_export import resources, fields
from import_export.widgets import JSONWidget
from .models import MarkingScheme


class MarkingSchemeResource(resources.ModelResource):
    contents = fields.Field(
        column_name="contents", attribute="contents", widget=JSONWidget()
    )

    class Meta:
        model = MarkingScheme
        fields = ("id", "label", "marks", "weightage", "pic", "contents")
        export_order = ("id", "label", "marks", "weightage", "pic", "contents")


def before_import_row(self, row, **kwargs):
    import json

    if "contents" in row:
        value = row["contents"]
        if isinstance(value, str):
            try:
                row["contents"] = json.loads(value)
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON in contents for row: {row}")
        elif isinstance(value, list):
            row["contents"] = value
        else:
            raise ValueError(f"Unsupported type for contents in row: {row}")
