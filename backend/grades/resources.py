from users.models import Student, User
from .models import Grade, Rubric, Criteria, StudentMark, StudentGrade
from import_export import resources
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
    mode = Field(attribute="mode", column_name="rubric_mode")
    steps = Field(attribute="steps", column_name="rubric_steps")

    class Meta:
        model = Rubric
        fields = ("label", "weightage", "pic", "course", "mode", "steps")
        import_id_fields = ("label",)

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
                    rubric = Rubric.objects.get(label=rubric_label)
                    Criteria.objects.update_or_create(
                        rubric=rubric,
                        label=criteria_label,
                        defaults={
                            "weightage": float(row.get("weightage", 0)),
                            "max_mark": float(row.get("max_mark", 0)),
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
    rubric = Field(
        column_name="rubric_label",
        attribute="rubric",
        widget=ForeignKeyWidget(Rubric, field="label"),
    )

    class Meta:
        model = Criteria
        fields = ("label", "weightage", "max_mark", "rubric")
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
        # Create or update Rubric if necessary
        rubric_label = row.get("rubric_label")
        if rubric_label:
            rubric_data = {
                "label": rubric_label,
                "weightage": float(row.get("rubric_weightage", 0)),
                "pic": json.loads(row.get("rubric_pic", "[]")),
                "course": row.get("rubric_course", "FYP1"),
                "mode": row.get("rubric_mode", "both"),
                "steps": int(row.get("rubric_steps", 0)),
            }
            Rubric.objects.update_or_create(label=rubric_label, defaults=rubric_data)


# Resource for StudentMark
class StudentMarkResource(resources.ModelResource):
    student = Field(
        column_name="student_id",
        attribute="student",
        widget=ForeignKeyWidget(Student, field="id"),
    )
    criteria = Field(
        column_name="criteria_id",
        attribute="criteria",
        widget=ForeignKeyWidget(Criteria, field="id"),
    )
    evaluator = Field(
        column_name="evaluator_id",
        attribute="evaluator",
        widget=ForeignKeyWidget(User, field="id"),
    )

    class Meta:
        model = StudentMark
        fields = ("student_id", "criteria_id", "evaluator_id", "mark")
        import_id_fields = ("student", "criteria", "evaluator")


# Resource for StudentGrades
class StudentGradesResource(resources.ModelResource):
    student = Field(
        column_name="student_id",
        attribute="student",
        widget=ForeignKeyWidget(Student, field="id"),
    )

    class Meta:
        model = StudentGrade
        fields = ("student_id", "total_mark")
        import_id_fields = ("student",)


# Resource class for import/export
class GradeResource(resources.ModelResource):
    class Meta:
        model = Grade
        fields = ("id", "grade_letter", "gpa_value", "min_mark", "max_mark")
