# users/utils.py
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import CourseCoordinator

User = get_user_model()


def get_coordinator_course_filter(request):
    """
    Returns a tuple of (course_filter, is_coordinator).
    - course_filter: Q object to filter querysets based on coordinator's course, 'Both', and 'inactive'.
    - is_coordinator: Boolean indicating if the user is a course coordinator.
    """
    user = request.user
    if user.is_superuser:
        return None, False
    try:
        coordinator = CourseCoordinator.objects.get(user=user)
        if coordinator.course == "Both":
            return Q(course__in=["FYP1", "FYP2", "inactive"]), True
        return Q(course=coordinator.course) | Q(course="inactive"), True
    except CourseCoordinator.DoesNotExist:
        return None, False
