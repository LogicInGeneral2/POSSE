from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student


class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = "__all__"

    def clean_password(self):
        # Return the initial value (unchanged)
        return self.initial.get("password")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    list_display = ("id", "name", "username", "email", "role")
    list_filter = ("role",)
    search_fields = ("name", "email", "username")
    ordering = ("id",)
    readonly_fields = ("username",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "role")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "role", "password1", "password2"),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password") and not change:
            obj.set_password(form.cleaned_data["password"])
        elif change:
            existing = User.objects.get(pk=obj.pk)
            if existing.password != obj.password:
                obj.set_password(obj.password)
        obj.save()


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "student_id", "course", "supervisor_name")
    list_filter = ("course",)
    search_fields = ("user__name", "student_id", "user__email")

    def supervisor_name(self, obj):
        return obj.supervisor.name if obj.supervisor else "-"

    supervisor_name.short_description = "Supervisor"
