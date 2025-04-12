from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import User, Student


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "username",
            "role",
            "is_active",
            "is_staff",
            "is_examiner",
            "is_available",
        )
        export_order = fields


class StudentResource(resources.ModelResource):
    user = fields.Field(
        column_name="user", attribute="user", widget=ForeignKeyWidget(User, "id")
    )
    supervisor = fields.Field(
        column_name="supervisor",
        attribute="supervisor",
        widget=ForeignKeyWidget(User, "id"),
    )

    class Meta:
        model = Student
        fields = ("id", "user", "student_id", "course", "supervisor")
        export_order = fields
