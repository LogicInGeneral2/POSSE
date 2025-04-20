from django import forms
from .models import documentTheme


class themeForm(forms.ModelForm):
    class Meta:
        model = documentTheme
        fields = "__all__"
        widgets = {
            "primary": forms.TextInput(attrs={"type": "color"}),
            "secondary": forms.TextInput(attrs={"type": "color"}),
        }


class systemThemeForm(forms.ModelForm):
    class Meta:
        model = documentTheme
        fields = "__all__"
        widgets = {
            "main": forms.TextInput(attrs={"type": "color"}),
        }
