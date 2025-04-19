from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Outline, documentModes, documentTheme, documentCategories
from .serializers import (
    documentModeSerializer,
    documentThemeSerializer,
    documentCategoriesSerializer,
    OutlineSerializer,
)


class OutlineListView(APIView):
    def get(self, request):
        outlines = Outline.objects.all()
        serializer = OutlineSerializer(
            outlines, many=True, context={"request": request}
        )
        return Response(serializer.data)


class DocumentThemeListView(APIView):
    def get(self, request):
        themes = documentTheme.objects.all()
        serializer = documentThemeSerializer(themes, many=True)
        return Response(serializer.data)


class DocumentCategoryListView(APIView):
    def get(self, request):
        categories = documentCategories.objects.filter(visibility=True)
        serializer = documentCategoriesSerializer(categories, many=True)
        return Response(serializer.data)


class DocumentModeListView(APIView):
    def get(self, request):
        categories = documentModes.objects.filter(visibility=True)
        serializer = documentModeSerializer(categories, many=True)
        return Response(serializer.data)
