from rest_framework import serializers
from .models import Announcement, Period


class AnnouncementSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ["id", "title", "message", "src"]

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.src and request:
            return request.build_absolute_uri(obj.src.url)
        return None


class PeriodSerializer(serializers.ModelSerializer):
    days_left = serializers.SerializerMethodField()

    class Meta:
        model = Period
        fields = [
            "title",
            "description",
            "directory",
            "start_date",
            "end_date",
            "days_left",
        ]

    def get_days_left(self, obj):
        return obj.days_left()
