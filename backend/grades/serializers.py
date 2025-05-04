from rest_framework import serializers
from .models import MarkingScheme, Grade, Student, TotalMarks, User


class MarkingSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarkingScheme
        fields = ["id", "label", "marks", "weightage", "pic", "contents", "course"]


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


class TotalMarksSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()
    breakdown = serializers.JSONField()

    class Meta:
        model = TotalMarks
        fields = ["id", "student", "course", "total_mark", "breakdown", "updated_at"]


class UpdateTotalMarksSerializer(serializers.Serializer):
    total_mark = serializers.FloatField()
    breakdown = serializers.JSONField()

    def validate(self, data):
        total_mark = data.get("total_mark")
        breakdown = data.get("breakdown")
        student_id = self.context["student_id"]

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Invalid student ID.")

        # Verify breakdown keys match marking scheme labels
        schemes = MarkingScheme.objects.filter(course=student.course)
        expected_keys = {scheme.label for scheme in schemes}
        provided_keys = set(breakdown.keys())
        if provided_keys - expected_keys:
            raise serializers.ValidationError("Invalid scheme labels in breakdown.")

        # Verify breakdown sums to total_mark (within rounding error)
        breakdown_sum = sum(breakdown.values())
        if abs(breakdown_sum - total_mark) > 0.01:
            raise serializers.ValidationError(
                f"Breakdown sum ({breakdown_sum}) does not match total mark ({total_mark})."
            )

        return data
