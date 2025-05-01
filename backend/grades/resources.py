from import_export import resources, fields
from import_export.widgets import JSONWidget
from .models import MarkingScheme
from import_export.widgets import ForeignKeyWidget
from users.models import Student, User
from .models import Grade


class MarkingSchemeResource(resources.ModelResource):
    contents = fields.Field(
        column_name="contents", attribute="contents", widget=JSONWidget()
    )

    class Meta:
        model = MarkingScheme
        fields = ("id", "label", "marks", "weightage", "pic", "contents")
        export_order = ("id", "label", "marks", "weightage", "pic", "contents")


class GradeResource(resources.ModelResource):
    student = fields.Field(
        column_name="student",
        attribute="student",
        widget=ForeignKeyWidget(Student, field="id"),
    )
    scheme = fields.Field(
        column_name="scheme",
        attribute="scheme",
        widget=ForeignKeyWidget(MarkingScheme, field="id"),
    )
    grader = fields.Field(
        column_name="grader",
        attribute="grader",
        widget=ForeignKeyWidget(User, field="id"),
    )

    class Meta:
        model = Grade
        fields = (
            "id",
            "student",
            "scheme",
            "grader",
            "grades",
            "created_at",
            "updated_at",
        )
        export_order = fields


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
