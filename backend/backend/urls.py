from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from details.views import AllPeriodsView, AnnouncementListView, CurrentPeriodView
from users.views import CurrentUserView, LogoutView
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/users/me/", CurrentUserView.as_view(), name="current_user"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("announcement/", AnnouncementListView.as_view(), name="announcement-list"),
    path("period/", CurrentPeriodView.as_view(), name="current-period"),
    path("periods/", AllPeriodsView.as_view(), name="all-periods"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
