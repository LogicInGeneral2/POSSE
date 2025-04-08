from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import CurrentUserView, LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/users/me/", CurrentUserView.as_view(), name="current_user"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/logout/", LogoutView.as_view(), name="logout"),
]
