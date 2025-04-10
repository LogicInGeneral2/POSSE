from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Outline, documentTheme, documentCategories
from .serializers import (
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
        categories = documentCategories.objects.all()
        serializer = documentCategoriesSerializer(categories, many=True)
        return Response(serializer.data)
