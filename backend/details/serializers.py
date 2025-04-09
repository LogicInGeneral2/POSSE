from rest_framework import serializers
from .models import Announcement, Period


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["id", "title", "message", "src"]


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
