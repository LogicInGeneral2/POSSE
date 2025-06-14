from rest_framework import serializers
from .models import Rubric, Criteria, StudentMark


class CriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criteria
        fields = ["id", "label", "weightage", "max_mark", "mode"]


class RubricSerializer(serializers.ModelSerializer):
    contents = serializers.SerializerMethodField()
    marks = serializers.SerializerMethodField()

    class Meta:
        model = Rubric
        fields = [
            "id",
            "label",
            "weightage",
            "course",
            "steps",
            "contents",
            "marks",
        ]

    def get_contents(self, obj):
        return [criteria.label for criteria in obj.criterias.all()]

    def get_marks(self, obj):

        criteria = obj.criterias.first()
        return int(criteria.max_mark) if criteria else 0


class StudentMarkSerializer(serializers.ModelSerializer):
    criteria = CriteriaSerializer()
    student = serializers.StringRelatedField()
    evaluator = serializers.StringRelatedField()

    class Meta:
        model = StudentMark
        fields = ["student", "criteria", "mark", "evaluator"]


class TotalMarksSerializer(serializers.Serializer):
    id = serializers.IntegerField(source="student.id")
    student = serializers.CharField(source="student.__str__")
    mode = serializers.CharField(source="student.mode")
    course = serializers.CharField(source="student.course")
    total_mark = serializers.FloatField()
    breakdown = serializers.SerializerMethodField()
    grade_letter = serializers.SerializerMethodField()
    grade_gpa = serializers.SerializerMethodField()

    def get_grade_gpa(self, obj):
        grade = obj.grade
        return grade.gpa_value if grade else "N/A"

    def get_grade_letter(self, obj):
        grade = obj.grade
        return grade.grade_letter if grade else "N/A"

    def get_breakdown(self, obj):
        student_marks = StudentMark.objects.filter(student=obj.student).select_related(
            "criteria__rubric"
        )
        breakdown = {}
        for rubric in Rubric.objects.filter(course=obj.student.course).order_by(
            "steps"
        ):
            criteria_list = rubric.criterias.filter(mode__in=[obj.student.mode, "both"])
            rubric_score = 0
            for criteria in criteria_list:
                marks = student_marks.filter(criteria_id=criteria.id)
                if marks.exists():
                    avg_mark = sum(mark.mark for mark in marks) / marks.count()
                    normalized_score = (
                        avg_mark / criteria.max_mark * criteria.weightage
                    ) / 100
                    rubric_score += normalized_score
            # Apply rubric weightage
            rubric_total = rubric_score * rubric.weightage
            breakdown[rubric.label] = round(
                rubric_total, 2
            )  # Round to 2 decimal places
        return breakdown


class MarkingSchemeSerializer(serializers.ModelSerializer):
    contents = serializers.SerializerMethodField()
    marks = serializers.SerializerMethodField()

    class Meta:
        model = Rubric
        fields = ["id", "label", "weightage", "pic", "contents", "course", "marks"]

    def get_contents(self, obj):
        # Return labels of related Criteria
        return [criteria.label for criteria in obj.criterias.all()]

    def get_marks(self, obj):
        # Return max_mark from first Criteria, assuming all Criteria have the same max_mark
        criteria = obj.criterias.first()
        return int(criteria.max_mark) if criteria else 0
