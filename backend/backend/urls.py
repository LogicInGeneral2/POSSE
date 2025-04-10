from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from settings.views import (
    DocumentCategoryListView,
    DocumentThemeListView,
    OutlineListView,
)
from documents.views import (
    DeleteSubmissionView,
    DocumentListView,
    FeedbackUploadView,
    LatestStudentSubmissionView,
    StudentSubmissionsView,
    UploadStudentSubmissionView,
)
from details.views import (
    AllPeriodsView,
    AnnouncementListView,
    CurrentPeriodView,
)
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
    path("outline/", OutlineListView.as_view(), name="outline-list"),
    path("period/", CurrentPeriodView.as_view(), name="current-period"),
    path("periods/", AllPeriodsView.as_view(), name="all-periods"),
    path("documents/", DocumentListView.as_view(), name="documents"),
    path(
        "submissions/<int:student_id>/",
        StudentSubmissionsView.as_view(),
        name="student-submissions",
    ),
    path(
        "submissions/<int:student_id>/latest/",
        LatestStudentSubmissionView.as_view(),
        name="latest-submission",
    ),
    path(
        "submissions/upload/<int:student_id>/",
        UploadStudentSubmissionView.as_view(),
        name="upload-student-submission",
    ),
    path(
        "submissions/delete/<int:student_id>/<int:studentsubmission_id>/",
        DeleteSubmissionView.as_view(),
        name="delete-submission",
    ),
    path("upload-feedback/", FeedbackUploadView.as_view(), name="upload-feedback"),
    path("documents/themes/", DocumentThemeListView.as_view(), name="document-themes"),
    path(
        "documents/categories/",
        DocumentCategoryListView.as_view(),
        name="document-categories",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
