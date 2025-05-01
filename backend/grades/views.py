from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import MarkingScheme, Grade, Student, User
from .serializers import (
    MarkingSchemeSerializer,
    GradeSerializer,
    SaveGradeSerializer,
)


class GetMarkingSchemeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        user = request.user
        student = Student.objects.get(id=student_id)

        if user.role == "course_coordinator":
            schemes = MarkingScheme.objects.filter(course=student.course)
        elif user.is_examiner and user in student.evaluators.all():
            schemes = MarkingScheme.objects.filter(
                pic="examiner", course=student.course
            )
        else:
            schemes = MarkingScheme.objects.filter(
                pic="supervisor", course=student.course
            )

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
            any_created = False  # Track if any grade was created
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
                    any_created = True  # Set flag if any grade was created

            return Response(
                responses,
                status=status.HTTP_201_CREATED if any_created else status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
