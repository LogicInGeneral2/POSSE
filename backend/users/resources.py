from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import User, Student, CourseCoordinator
from django.contrib.auth.hashers import make_password


class UserResource(resources.ModelResource):
    password = fields.Field(column_name="password", attribute="password")

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
            "password",
        )
        export_order = fields

    def before_import_row(self, row, **kwargs):
        if not row.get("password"):
            raise ValueError("Password is required for User import.")
        row["password"] = make_password(row["password"])
        if row.get("role") == "student":
            row["is_examiner"] = False
            row["is_available"] = False
        if row.get("role") == "course_coordinator":
            row["is_staff"] = True


class CourseCoordinatorResource(resources.ModelResource):
    user = fields.Field(
        column_name="user", attribute="user", widget=ForeignKeyWidget(User, "id")
    )

    class Meta:
        model = CourseCoordinator
        fields = ("id", "user", "course")
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
    email = fields.Field(column_name="email")
    name = fields.Field(column_name="name")
    password = fields.Field(column_name="password")
    role = fields.Field(column_name="role", default="student")

    class Meta:
        model = Student
        fields = (
            "id",
            "user",
            "student_id",
            "course",
            "supervisor",
            "email",
            "name",
            "password",
            "role",
        )
        export_order = fields

    def before_import_row(self, row, **kwargs):
        if not row.get("password"):
            raise ValueError("Password is required for Student import.")
        if not row.get("user") and row.get("email"):
            user_data = {
                "email": row["email"],
                "name": row.get("name", ""),
                "role": row.get("role", "student"),
                "password": row["password"],
                "is_active": True,
                "is_staff": False,
                "is_examiner": False,
                "is_available": False,
            }
            try:
                user = User.objects.create_user(**user_data)
                row["user"] = user.id
                if Student.objects.filter(user=user).exists():
                    student = Student.objects.get(user=user)
                    student.student_id = row.get("student_id", student.student_id)
                    student.course = row.get("course", student.course)
                    if row.get("supervisor"):
                        student.supervisor_id = row["supervisor"]
                    student.save()
                    row["_skip_instance_creation"] = True
            except ValueError as e:
                raise ValueError(f"Failed to create User: {str(e)}")

    def save_instance(self, instance, new, row, **kwargs):
        if row.get("_skip_instance_creation"):
            return
        super().save_instance(instance, new, row, **kwargs)
