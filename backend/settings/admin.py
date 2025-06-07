from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Outline,
    documentModes,
    submissionStatusTheme,
    systemTheme,
)
from .utils import systemThemeForm, themeForm


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


@admin.register(documentModes)
class documentModesAdmin(admin.ModelAdmin):
    list_display = ["label"]
    list_per_page = 20


@admin.register(submissionStatusTheme)
class submissionStatusThemeAdmin(admin.ModelAdmin):
    list_display = ["label", "get_primary_color", "get_secondary_color"]
    list_per_page = 20
    form = themeForm
    readonly_fields = ["label"]

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=...):
        return False

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


@admin.register(systemTheme)
class systemThemeAdmin(admin.ModelAdmin):
    list_display = ["label", "get_main_color"]
    list_per_page = 20
    form = systemThemeForm
    readonly_fields = ["label"]

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=...):
        return False

    def get_main_color(self, obj):
        return format_html(
            '<div style="width: 50px; height: 20px; background:{};"></div>', obj.main
        )

    get_main_color.short_description = "Main Color"
