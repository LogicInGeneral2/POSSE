from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Announcement, Period
from .serializers import AnnouncementSerializer, PeriodSerializer
from django.utils import timezone


class AnnouncementListView(APIView):
    def get(self, request):
        announcements = Announcement.objects.all()
        serializer = AnnouncementSerializer(
            announcements, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CurrentPeriodView(APIView):
    def get(self, request):
        today = timezone.now().date()
        period = Period.objects.filter(
            start_date__lte=today, end_date__gte=today
        ).first()

        if request.path.endswith("selection/"):
            if period and period.is_selection_period:
                return Response(True)
            return Response(False)

        if period:
            serializer = PeriodSerializer(period)
            return Response(serializer.data)
        else:
            return Response(
                {
                    "title": "No Period",
                    "description": "There is currently no active period.",
                    "directory": "",
                    "start_date": None,
                    "end_date": None,
                    "days_left": 0,
                },
                status=200,
            )


class AllPeriodsView(APIView):
    def get(self, request):
        periods = Period.objects.all()
        serializer = PeriodSerializer(periods, many=True)
        return Response(serializer.data)
