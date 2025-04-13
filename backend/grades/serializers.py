from rest_framework import serializers
from .models import MarkingScheme, Grade, Student, User


class MarkingSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarkingScheme
        fields = ["id", "label", "marks", "weightage", "pic", "contents"]


class GradeSerializer(serializers.ModelSerializer):
    scheme = MarkingSchemeSerializer(read_only=True)
    student = serializers.StringRelatedField()
    grader = serializers.StringRelatedField()

    class Meta:
        model = Grade
        fields = [
            "id",
            "student",
            "scheme",
            "grader",
            "grades",
            "created_at",
            "updated_at",
        ]


class GradeEntrySerializer(serializers.Serializer):
    scheme_id = serializers.IntegerField()
    grades = serializers.ListField(child=serializers.IntegerField())


class SaveGradeSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    grades = serializers.ListField(child=GradeEntrySerializer())

    def validate(self, data):
        user_id = data.get("user_id")
        grades_data = data.get("grades")
        student_id = self.context["student_id"]

        try:
            grader = User.objects.get(id=user_id, role__in=["supervisor", "examiner"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid grader ID.")

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Invalid student ID.")

        for grade_entry in grades_data:
            scheme_id = grade_entry.get("scheme_id")
            grades = grade_entry.get("grades")
            try:
                scheme = MarkingScheme.objects.get(id=scheme_id)
            except MarkingScheme.DoesNotExist:
                raise serializers.ValidationError(f"Invalid scheme ID: {scheme_id}.")

            # Validate grader authorization
            if scheme.pic == "supervisor" and student.supervisor != grader:
                raise serializers.ValidationError(
                    f"Grader is not the supervisor for scheme {scheme_id}."
                )
            if scheme.pic == "evaluator" and grader not in student.evaluators.all():
                raise serializers.ValidationError(
                    f"Grader is not an evaluator for scheme {scheme_id}."
                )

            # Validate grades length
            if len(grades) != len(scheme.contents):
                raise serializers.ValidationError(
                    f"Grades length ({len(grades)}) does not match contents length ({len(scheme.contents)}) for scheme {scheme_id}."
                )

        return data
