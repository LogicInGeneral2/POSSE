from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from grades.views import GetGradesView, GetMarkingSchemeView, SaveGradesView
from settings.views import (
    DocumentCategoryListView,
    DocumentModeListView,
    DocumentThemeListView,
    OutlineListView,
    SubmissionStatusThemeListView,
    systemThemeListView,
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
    export_logs_pdf,
)
from details.views import (
    AllPeriodsView,
    AnnouncementListView,
    CurrentPeriodView,
)
from users.views import (
    AvailableSupervisorsView,
    ChangePasswordView,
    CurrentUserView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    SuperviseeSubmissionsView,
    SupervisorListsView,
)
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path("admin/", admin.site.urls),
    path("theme/", systemThemeListView.as_view(), name="system-theme"),
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
        name="evaluatees-submissions",
    ),
    path(
        "api/users/students/<str:category>/",
        SuperviseeSubmissionsView.as_view(),
        name="students-submissions",
    ),
    path(
        "api/users/change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path("api-auth/", include("rest_framework.urls")),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path(
        "api/password-reset/request/",
        PasswordResetRequestView.as_view(),
        name="password_reset_request",
    ),
    path(
        "api/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
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
        "submissions/themes/",
        SubmissionStatusThemeListView.as_view(),
        name="student-submissions",
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
        "submissions/all/<int:student_id>/",
        StudentSubmissionsView.as_view(),
        name="all-student-submissions",
    ),
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
    path(
        "documents/modes/",
        DocumentModeListView.as_view(),
        name="document-categories",
    ),
    path("logbooks/", LogbookCreateUpdateView.as_view()),
    path("logbooks/<int:pk>/", LogbookCreateUpdateView.as_view()),
    path("logbooks/<int:pk>/status/", LogbookStatusUpdateView.as_view()),
    path("logbooks/student/<int:student_id>/", LogbookListView.as_view()),
    path("logbooks/<int:student_id>/calendar/", LogbookListView.as_view()),
    path("logbooks/export/<int:student_id>/", export_logs_pdf, name="export_logs_pdf"),
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
