from rest_framework import serializers
from .models import Document, StudentSubmission, Feedback
from details.models import Submissions


class DocumentSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "title", "category", "upload_date", "src", "thumbnail_url"]

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class StudentSubmissionSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = StudentSubmission
        fields = ["id", "student", "submission_phase", "file", "upload_date"]

    def get_file(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class FeedbackSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = ["id", "upload_date", "src", "file", "supervisor", "submission"]

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class SubmissionPhaseSerializer(serializers.ModelSerializer):
    days_left = serializers.SerializerMethodField()

    class Meta:
        model = Submissions
        fields = "__all__"

    def get_days_left(self, obj):
        return obj.days_left()


class CombinedSubmissionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    date_open = serializers.DateField(format="%d-%m-%Y")
    date_close = serializers.DateField(format="%d-%m-%Y")
    days_left = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    description = serializers.CharField()
    submission = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()

    def get_days_left(self, obj):
        return obj.days_left()

    def get_status(self, obj):
        student = self.context.get("student")
        return obj.get_dynamic_status(student)

    def get_submission(self, obj):
        student = self.context.get("student")
        submission = obj.studentsubmission_set.filter(student=student).first()
        if not submission:
            return {}
        return {
            "id": submission.id,
            "title": submission.file.name.split("/")[-1],
            "upload_date": submission.upload_date,
            "src": submission.file.url,
            "status": "Reviewed" if submission.feedback_set.exists() else "Submitted",
            "type": "submission",
            "studentId": student.id,
            "assignmentId": obj.id,
        }

    def get_feedback(self, obj):
        student = self.context.get("student")
        submission = obj.studentsubmission_set.filter(student=student).first()
        if not submission:
            return {}
        feedback = submission.feedback_set.first()
        if not feedback:
            return {}
        return {
            "id": feedback.id,
            "title": "Feedback",
            "upload_date": feedback.upload_date,
            "src": feedback.file.url,
            "type": "feedback",
            "supervisorId": feedback.supervisor.id,
            "submissionId": submission.id,
        }


class StudentAllSubmissionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    src = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    studentId = serializers.SerializerMethodField()
    assignmentId = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()

    def get_title(self, obj):
        return obj.file.name.split("/")[-1] if obj.file else ""

    def get_src(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url) if obj.file and request else ""

    def get_status(self, obj):
        return "Reviewed" if obj.feedback_set.exists() else "Submitted"

    def get_type(self, obj):
        return "submission"

    def get_studentId(self, obj):
        return obj.student.id

    def get_assignmentId(self, obj):
        return obj.submission_phase.id

    def get_feedback(self, obj):
        feedback = obj.feedback_set.first()
        if not feedback:
            return {}

        return {
            "id": feedback.id,
            "title": "Feedback",
            "upload_date": feedback.upload_date,
            "src": feedback.file.url,
            "type": "feedback",
            "supervisorId": feedback.supervisor.id,
            "submissionId": obj.id,
        }


class SubmissionUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSubmission
        fields = ["file", "submission_phase"]

    def create(self, validated_data):
        student = self.context["student"]
        return StudentSubmission.objects.create(student=student, **validated_data)
