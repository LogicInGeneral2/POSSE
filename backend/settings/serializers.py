from rest_framework import serializers

from .models import Outline, documentCategories, documentTheme


class OutlineSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Outline
        fields = ["id", "label", "src"]

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.src and request:
            return request.build_absolute_uri(obj.src.url)
        return None


class documentThemeSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source="value.label", read_only=True)

    class Meta:
        model = documentTheme
        fields = "__all__"


class documentCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = documentCategories
        fields = "__all__"


class documentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = documentCategories
        fields = "__all__"
