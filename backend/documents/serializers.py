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
    class Meta:
        model = StudentSubmission
        fields = "__all__"


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"


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
            "progress": "Progress ?",  # Optional field if stored elsewhere
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


class SubmissionUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSubmission
        fields = ["file", "submission_phase"]

    def create(self, validated_data):
        student = self.context["student"]
        return StudentSubmission.objects.create(student=student, **validated_data)
