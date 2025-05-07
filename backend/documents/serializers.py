from rest_framework import serializers
from .models import Document, Logbook, StudentSubmission, Feedback
from details.models import Submissions


class DocumentSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    category = serializers.StringRelatedField()
    mode = serializers.StringRelatedField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "category",
            "upload_date",
            "src",
            "thumbnail_url",
            "mode",
        ]

    def get_src(self, obj):
        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.file.url) if obj.file and request else None
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.thumbnail.url)
            if obj.thumbnail and request
            else None
        )


class MarkingSchemeSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["src"]

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
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
        fields = [
            "id",
            "upload_date",
            "src",
            "file",
            "supervisor",
            "submission",
            "comment",
        ]

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
            return []

        feedbacks = submission.feedback_set.all()
        if not feedbacks:
            return []

        return [
            {
                "id": feedback.id,
                "title": "Feedback",
                "upload_date": feedback.upload_date,
                "comment": feedback.comment,
                "src": feedback.file.url if feedback.file else "",
                "type": "feedback",
                "supervisorId": feedback.supervisor.id,
                "supervisorName": feedback.supervisor.name,
                "submissionId": submission.id,
            }
            for feedback in feedbacks
        ]


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
        return obj.submission_phase.title

    def get_src(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url) if obj.file and request else ""

    def get_status(self, obj):
        request = self.context.get("request")
        return (
            "Reviewed"
            if request and obj.feedback_set.filter(supervisor=request.user).exists()
            else "Submitted"
        )

    def get_type(self, obj):
        return "submission"

    def get_studentId(self, obj):
        return obj.student.id

    def get_assignmentId(self, obj):
        return obj.submission_phase.id

    def get_feedback(self, obj):
        request = self.context.get("request")
        if not request:
            return {}

        feedback = obj.feedback_set.filter(supervisor=request.user).first()
        if not feedback:
            return {}

        return {
            "id": feedback.id,
            "title": "Feedback",
            "upload_date": feedback.upload_date,
            "src": request.build_absolute_uri(feedback.file.url)
            if feedback.file
            else "",
            "comment": feedback.comment,
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


class LogbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logbook
        fields = "__all__"


class LogbookCallSerializer(serializers.Serializer):
    class Meta:
        model = Logbook
        fields = [
            "date",
            "activities",
            "feedbacks",
            "plan",
            "id",
        ]
