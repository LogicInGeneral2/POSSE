from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
    Outline,
    documentModes,
    submissionStatusTheme,
    systemTheme,
)
from .serializers import (
    documentModeSerializer,
    OutlineSerializer,
    submissionStatusThemeSerializer,
    systemThemeSerializer,
)
from rest_framework.permissions import AllowAny


class OutlineListView(APIView):
    def get(self, request):
        outlines = Outline.objects.all()
        serializer = OutlineSerializer(
            outlines, many=True, context={"request": request}
        )
        return Response(serializer.data)


class DocumentModeListView(APIView):
    def get(self, request):
        categories = documentModes.objects.filter(visibility=True)
        serializer = documentModeSerializer(categories, many=True)
        return Response(serializer.data)


class SubmissionStatusThemeListView(APIView):
    def get(self, request):
        themes = submissionStatusTheme.objects.all()
        serializer = submissionStatusThemeSerializer(themes, many=True)
        return Response(serializer.data)


class systemThemeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        themes = systemTheme.objects.all()
        serializer = systemThemeSerializer(themes, many=True)
        return Response(serializer.data)
