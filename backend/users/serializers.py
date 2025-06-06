from rest_framework import serializers
from .models import SupervisorsRequest, User, Student


class UserSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "course"]

    def get_course(self, instance):
        if instance.role == "student" and hasattr(instance, "student"):
            return instance.student.course
        elif instance.role == "course_coordinator" and hasattr(
            instance, "course_coordinator_profile"
        ):
            return instance.course_coordinator_profile.course
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if hasattr(instance, "course_coordinator_profile"):
            instance.role = "course_coordinator"
            data["role"] = "course_coordinator"

        if instance.role == "student" and hasattr(instance, "student"):
            student = instance.student
            data["student_id"] = student.student_id
            data["topic"] = student.topic
            data["mode"] = student.mode
            data["supervisor"] = student.supervisor.name if student.supervisor else None
            data["supervisor_email"] = (
                student.supervisor.email if student.supervisor else None
            )
            data["evaluators"] = [e.name for e in student.evaluators.all()]

        elif instance.role == "supervisor" or instance.role == "course_coordinator":
            data["supervisor_id"] = instance.id
            data["supervisees_FYP1"] = instance.supervisees.filter(
                course="FYP1"
            ).count()
            data["supervisees_FYP2"] = instance.supervisees.filter(
                course="FYP2"
            ).count()
            data["evaluatees_FYP1"] = instance.evaluatees.filter(course="FYP1").count()
            data["evaluatees_FYP2"] = instance.evaluatees.filter(course="FYP2").count()

        return data


class BreadcrumbSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["student_id", "course", "topic", "mode"]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    supervisor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="supervisor"), allow_null=True
    )
    evaluators = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="examiner"), many=True, required=False
    )

    class Meta:
        model = Student
        fields = ["id", "user", "student_id", "course", "supervisor", "evaluators"]

    def validate(self, data):
        supervisor = data.get("supervisor")
        evaluators = data.get("evaluators", [])

        if supervisor and supervisor in evaluators:
            raise serializers.ValidationError(
                "A supervisor cannot also be an evaluator."
            )
        return data


class SupervisorViewSerializer(serializers.ModelSerializer):
    supervisees_FYP1 = serializers.SerializerMethodField()
    supervisees_FYP2 = serializers.SerializerMethodField()
    evaluatees_FYP1 = serializers.SerializerMethodField()
    evaluatees_FYP2 = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "username",
            "role",
            "supervisees_FYP1",
            "supervisees_FYP2",
            "evaluatees_FYP1",
            "evaluatees_FYP2",
        ]

    def get_supervisees_FYP1(self, obj):
        return list(obj.supervisees.filter(course="FYP1").values_list("id", flat=True))

    def get_supervisees_FYP2(self, obj):
        return list(obj.supervisees.filter(course="FYP2").values_list("id", flat=True))

    def get_evaluatees_FYP1(self, obj):
        return list(obj.evaluatees.filter(course="FYP1").values_list("id", flat=True))

    def get_evaluatees_FYP2(self, obj):
        return list(obj.evaluatees.filter(course="FYP2").values_list("id", flat=True))


class SupervisorsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name"]


class SupervisorChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupervisorsRequest
        fields = [
            "first_id",
            "first_name",
            "second_id",
            "second_name",
            "third_id",
            "third_name",
            "topic",
            "mode",
            "cgpa",
            "first_proof",
            "second_proof",
            "third_proof",
        ]

    def get_proof(self, obj):
        request = self.context.get("request")
        if obj.proof and request:
            return request.build_absolute_uri(obj.proof.url)
        return None
