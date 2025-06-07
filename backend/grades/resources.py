from users.models import Student, User
from .models import Grade, Rubric, Criteria, StudentMark, StudentGrade
from import_export import resources, fields
from import_export.fields import Field
from import_export.widgets import ForeignKeyWidget, JSONWidget
import json


# Resource for Rubric with nested Criteria
class RubricResource(resources.ModelResource):
    # Map CSV columns to model fields
    label = Field(attribute="label", column_name="rubric_label")
    weightage = Field(attribute="weightage", column_name="rubric_weightage")
    pic = Field(attribute="pic", column_name="rubric_pic", widget=JSONWidget())
    course = Field(attribute="course", column_name="rubric_course")
    steps = Field(attribute="steps", column_name="rubric_steps")

    class Meta:
        model = Rubric
        fields = ("label", "weightage", "pic", "course", "steps")
        import_id_fields = (
            "label",
            "course",
        )  # Changed to include both label and course

    def before_import_row(self, row, **kwargs):
        # Handle case-insensitive course field
        if row.get("rubric_course"):
            row["rubric_course"] = row["rubric_course"].upper()
        # Ensure rubric_pic is a valid JSON string
        if row.get("rubric_pic"):
            try:
                json.loads(row["rubric_pic"])
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON in rubric_pic: {row['rubric_pic']}")

    def after_import_row(self, row, row_result, **kwargs):
        # Create criteria after rubric is created/updated
        if not row_result.errors:
            rubric_label = row.get("rubric_label")
            criteria_label = row.get("label")

            if rubric_label and criteria_label:
                try:
                    rubric = Rubric.objects.get(
                        label=rubric_label, course=row.get("rubric_course")
                    )
                    Criteria.objects.update_or_create(
                        rubric=rubric,
                        label=criteria_label,
                        defaults={
                            "weightage": float(row.get("weightage", 0)),
                            "max_mark": float(row.get("max_mark", 0)),
                            "mode": row.get("mode", "both"),
                        },
                    )
                except Exception as e:
                    row_result.errors.append(f"Error creating criteria: {str(e)}")


# Resource for Criteria
class CriteriaResource(resources.ModelResource):
    # Map CSV columns to model fields for criteria
    label = Field(attribute="label", column_name="label")
    weightage = Field(attribute="weightage", column_name="weightage")
    max_mark = Field(attribute="max_mark", column_name="max_mark")
    mode = Field(attribute="mode", column_name="mode")
    rubric = Field(
        column_name="rubric_label",
        attribute="rubric",
        widget=ForeignKeyWidget(Rubric, field="label"),
    )

    class Meta:
        model = Criteria
        fields = ("label", "weightage", "max_mark", "mode", "rubric")
        import_id_fields = ("label", "rubric")

    def before_import_row(self, row, **kwargs):
        # Handle case-insensitive course field
        if row.get("rubric_course"):
            row["rubric_course"] = row["rubric_course"].upper()
        # Ensure rubric_pic is a valid JSON string
        if row.get("rubric_pic"):
            try:
                json.loads(row["rubric_pic"])
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON in rubric_pic: {row['rubric_pic']}")
        # Validate mode field
        if row.get("mode"):
            valid_modes = {"both", "development", "research"}
            if row["mode"] not in valid_modes:
                raise ValueError(
                    f"Invalid mode: {row['mode']}. Must be one of {valid_modes}"
                )
        # Create or update Rubric if necessary
        rubric_label = row.get("rubric_label")
        if rubric_label:
            rubric_data = {
                "label": rubric_label,
                "weightage": float(row.get("rubric_weightage", 0)),
                "pic": json.loads(row.get("rubric_pic", "[]")),
                "course": row.get("rubric_course", "FYP1"),
                "steps": int(row.get("rubric_steps", 0)),
            }
            Rubric.objects.update_or_create(
                label=rubric_label,
                course=row.get("rubric_course", "FYP1"),
                defaults=rubric_data,
            )


# Resource for StudentMark
class StudentMarkResource(resources.ModelResource):
    student = fields.Field(
        column_name="student_name",
        attribute="student",
        widget=ForeignKeyWidget(Student, "user__name"),
    )
    criteria = fields.Field(
        column_name="criteria_label",
        attribute="criteria",
        widget=ForeignKeyWidget(Criteria, "label"),
    )
    evaluator = fields.Field(
        column_name="evaluator_name",
        attribute="evaluator",
        widget=ForeignKeyWidget(User, "name"),  # or "get_full_name", if defined
    )

    class Meta:
        model = StudentMark
        fields = ("student", "criteria", "evaluator", "mark")
        export_order = ("student", "criteria", "evaluator", "mark")
        import_id_fields = ("student", "criteria", "evaluator")


# Resource for StudentGrades
class StudentGradesResource(resources.ModelResource):
    student = fields.Field(
        column_name="student_name",
        attribute="student",
        widget=ForeignKeyWidget(Student, "user__name"),
    )
    grade = fields.Field(
        column_name="grade_letter",
        attribute="grade",
        widget=ForeignKeyWidget(Grade, "grade_letter"),
    )
    grade_gpa = fields.Field(
        column_name="grade_gpa",
        attribute="grade",
        widget=ForeignKeyWidget(Grade, "gpa_value"),
    )

    class Meta:
        model = StudentGrade
        fields = ("student", "total_mark", "grade", "grade_gpa")
        import_id_fields = ("student",)


# Resource class for import/export
class GradeResource(resources.ModelResource):
    class Meta:
        model = Grade
        fields = ("id", "grade_letter", "gpa_value", "min_mark", "max_mark")
