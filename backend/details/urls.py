from django.urls import path
from .views import AnnouncementListView, CurrentPeriodView, AllPeriodsView

urlpatterns = [
    path("announcement/", AnnouncementListView.as_view(), name="announcement-list"),
    path("period/", CurrentPeriodView.as_view(), name="current-period"),
    path("periods/", AllPeriodsView.as_view(), name="all-periods"),
]
