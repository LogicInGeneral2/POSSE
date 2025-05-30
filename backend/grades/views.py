from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from users.models import CourseCoordinator
from .models import MarkingScheme, Grade, Student, User, TotalMarks
from .serializers import (
    MarkingSchemeSerializer,
    GradeSerializer,
    SaveGradeSerializer,
    TotalMarksSerializer,
)


class GetMarkingSchemeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        user = request.user

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        schemes = None
        user_roles = []

        # Check if the user is an evaluator for this student
        if user in student.evaluators.all():
            if user.role == "examiner" or user.is_examiner:
                user_roles.append("examiner")

        if user == student.supervisor:
            user_roles.append("supervisor")

        # Check if the user is the course coordinator for this student's course
        if user.role == "course_coordinator":
            try:
                coordinator = CourseCoordinator.objects.get(user=user)
                course = coordinator.course
                if course == "Both" or course == student.course:
                    user_roles.append("course_coordinator")
                else:
                    return Response(
                        {"error": "Not allowed to view this course's schemes."},
                        status=403,
                    )
            except CourseCoordinator.DoesNotExist:
                return Response({"error": "Coordinator record not found"}, status=403)

        if user_roles:
            query = Q(course=student.course)
            for role in user_roles:
                query &= Q(pic__contains=role) & (Q(mode=student.mode) | Q(mode="both"))
            schemes = MarkingScheme.objects.filter(query).order_by("steps")
        else:
            return Response({"error": "Access denied."}, status=403)

        serializer = MarkingSchemeSerializer(schemes, many=True)
        return Response(serializer.data)


class GetGradesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        if user.role == "supervisor" and student.supervisor != user:
            if user.role == "examiner" and user not in student.evaluators.all():
                return Response(
                    {"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN
                )

        grades = Grade.objects.filter(student=student, grader=user)
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)


class SaveGradesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = SaveGradeSerializer(
            data=request.data, context={"student_id": student_id}
        )
        if serializer.is_valid():
            user_id = serializer.validated_data["user_id"]
            grades_data = serializer.validated_data["grades"]

            try:
                grader = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid grader ID"}, status=status.HTTP_400_BAD_REQUEST
                )

            responses = []
            any_created = False
            for grade_entry in grades_data:
                scheme_id = grade_entry["scheme_id"]
                grades = grade_entry["grades"]
                try:
                    scheme = MarkingScheme.objects.get(id=scheme_id)
                except MarkingScheme.DoesNotExist:
                    return Response(
                        {"error": f"Invalid scheme ID: {scheme_id}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                grade, created = Grade.objects.update_or_create(
                    student=student,
                    scheme=scheme,
                    grader=grader,
                    defaults={"grades": grades},
                )
                responses.append(GradeSerializer(grade).data)
                if created:
                    any_created = True

            return Response(
                responses,
                status=status.HTTP_201_CREATED if any_created else status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllTotalMarksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "student":
            return Response(
                {"error": "Only course coordinators can view total marks"},
                status=status.HTTP_403_FORBIDDEN,
            )

        total_marks = TotalMarks.objects.all().select_related("student__user")
        serializer = TotalMarksSerializer(total_marks, many=True)
        return Response(serializer.data)


class GetMarkingSchemeGradesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        course = request.query_params.get("course", "")

        schemes = (
            MarkingScheme.objects.filter(course=course)
            if course
            else MarkingScheme.objects.all()
        )

        serializer = MarkingSchemeSerializer(schemes, many=True)
        return Response(serializer.data)
