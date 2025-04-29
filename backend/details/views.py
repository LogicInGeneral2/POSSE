from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Announcement, Period
from .serializers import AnnouncementSerializer, PeriodSerializer
from django.utils import timezone


class AnnouncementListView(APIView):
    def get(self, request):
        user = request.user

        announcements = Announcement.objects.all()

        if user.role == "student":
            student_course = user.student.course
            announcements = announcements.filter(course__in=[student_course, "Both"])

        serializer = AnnouncementSerializer(
            announcements, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CurrentPeriodView(APIView):
    def get(self, request):
        today = timezone.now().date()
        user = request.user

        period_queryset = Period.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
        )

        if user.role == "student":
            student_course = user.student.course
            period_queryset = period_queryset.filter(
                course__in=[student_course, "Both"]
            )

        period = period_queryset.first()

        if request.path.endswith("selection/"):
            if period and period.is_selection_period:
                return Response(True)
            return Response(False)

        if period:
            serializer = PeriodSerializer(period)
            return Response(serializer.data)

        return Response(
            {
                "title": "No Period",
                "description": "There is currently no active period.",
                "directory": "",
                "start_date": None,
                "end_date": None,
                "days_left": 0,
                "course": "Both",
            },
            status=200,
        )


class AllPeriodsView(APIView):
    def get(self, request):
        user = request.user

        periods_queryset = Period.objects.all()

        if user.role == "student":
            student_course = user.student.course
            periods_queryset = periods_queryset.filter(
                course__in=[student_course, "Both"]
            )

        serializer = PeriodSerializer(periods_queryset, many=True)
        return Response(serializer.data)
