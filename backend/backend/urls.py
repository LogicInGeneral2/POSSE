from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from grades.views import GetGradesView, GetMarkingSchemeView, SaveGradesView
from settings.views import (
    DocumentCategoryListView,
    DocumentThemeListView,
    OutlineListView,
)
from documents.views import (
    DeleteFeedbackView,
    DeleteSubmissionView,
    DocumentListView,
    FeedbackUploadView,
    LatestStudentSubmissionView,
    LogbookCreateUpdateView,
    LogbookListView,
    LogbookStatusUpdateView,
    StudentSubmissionsView,
    UploadStudentSubmissionView,
)
from details.views import (
    AllPeriodsView,
    AnnouncementListView,
    CurrentPeriodView,
)
from users.views import (
    AvailableSupervisorsView,
    CurrentUserView,
    LogoutView,
    SuperviseeSubmissionsView,
    SupervisorListsView,
)
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/users/me/", CurrentUserView.as_view(), name="current_user"),
    path("api/users/supervisor/", CurrentUserView.as_view(), name="current_supervisor"),
    path(
        "api/users/supervisees/",
        SuperviseeSubmissionsView.as_view(),
        name="supervisee-submissions",
    ),
    path(
        "api/users/evaluatees/",
        SuperviseeSubmissionsView.as_view(),
        name="supervisee-submissions",
    ),
    path("api-auth/", include("rest_framework.urls")),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path(
        "users/supervisors/lists/",
        AvailableSupervisorsView.as_view(),
        name="available-supervisors",
    ),
    path("announcement/", AnnouncementListView.as_view(), name="announcement-list"),
    path("outline/", OutlineListView.as_view(), name="outline-list"),
    path("period/", CurrentPeriodView.as_view(), name="current-period"),
    path("period/selection/", CurrentPeriodView.as_view(), name="current-period"),
    path("periods/", AllPeriodsView.as_view(), name="all-periods"),
    path("documents/", DocumentListView.as_view(), name="documents"),
    path(
        "documents/scheme/<str:title>/",
        DocumentListView.as_view(),
        name="marking-scheme",
    ),
    path(
        "submissions/supervisors/choices/",
        SupervisorListsView.as_view(),
        name="student-submissions",
    ),
    path(
        "submissions/supervisors/choices/<int:student_id>/",
        SupervisorListsView.as_view(),
        name="student-submissions",
    ),
    path(
        "submissions/<int:student_id>/",
        StudentSubmissionsView.as_view(),
        name="student-submissions",
    ),
    path(
        "submissions/<int:student_id>/all/",
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
    path(
        "feedback/upload/<int:student_id>/",
        FeedbackUploadView.as_view(),
        name="upload-feedback",
    ),
    path(
        "feedback/delete/<int:feedback_id>/",
        DeleteFeedbackView.as_view(),
        name="delete-submission",
    ),
    path("documents/themes/", DocumentThemeListView.as_view(), name="document-themes"),
    path(
        "documents/categories/",
        DocumentCategoryListView.as_view(),
        name="document-categories",
    ),
    path("logbooks/", LogbookCreateUpdateView.as_view()),
    path("logbooks/<int:pk>/", LogbookCreateUpdateView.as_view()),
    path("logbooks/<int:pk>/status/", LogbookStatusUpdateView.as_view()),
    path("logbooks/student/<int:student_id>/", LogbookListView.as_view()),
    path(
        "grades/scheme/<int:student_id>/",
        GetMarkingSchemeView.as_view(),
        name="get-marking-scheme",
    ),
    path(
        "grades/student/<int:student_id>/", GetGradesView.as_view(), name="get-grades"
    ),
    path("grades/save/<int:student_id>/", SaveGradesView.as_view(), name="save-grades"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
