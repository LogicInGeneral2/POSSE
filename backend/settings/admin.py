from django.contrib import admin
from django.utils.html import format_html
from .models import Outline, documentCategories, documentTheme
from .utils import themeForm


@admin.register(Outline)
class OutlineAdmin(admin.ModelAdmin):
    list_display = ["label", "src_link"]
    search_fields = ["label"]
    list_per_page = 20

    def src_link(self, obj):
        if obj.src:
            return format_html(
                "<a href='{}' target='_blank'>View File</a>", obj.src.url
            )
        return "-"

    src_link.short_description = "File"


@admin.register(documentTheme)
class documentThemeAdmin(admin.ModelAdmin):
    list_display = ["value", "get_primary_color", "get_secondary_color"]
    search_fields = ["value__label"]
    list_per_page = 20
    form = themeForm

    def get_primary_color(self, obj):
        return format_html(
            '<div style="width: 50px; height: 20px; background:{};"></div>', obj.primary
        )

    get_primary_color.short_description = "Primary Color"

    def get_secondary_color(self, obj):
        return format_html(
            '<div style="width: 50px; height: 20px; background:{};"></div>',
            obj.secondary,
        )

    get_secondary_color.short_description = "Secondary Color"


@admin.register(documentCategories)
class documentCategoriesAdmin(admin.ModelAdmin):
    list_display = ["label"]
    search_fields = ["label"]
    list_per_page = 20
