from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Criteria, Rubric, StudentMark, StudentGrade
from users.models import Student, User
from .serializers import RubricSerializer, TotalMarksSerializer, MarkingSchemeSerializer
from django.db import transaction
from django.db.models import Prefetch


class GetMarkingSchemeView(APIView):
    def get(self, request, student_id):
        try:
            student = get_object_or_404(Student, id=student_id)
            user = request.user
            if not user.is_authenticated:
                return Response(
                    {"error": "User not authenticated"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Get user role
            user_role = getattr(user, "role", None)
            if not user_role:
                return Response(
                    {"error": "User role not found"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Initialize rubric query with criteria filtered by mode
            rubric_query = Rubric.objects.filter(
                course=student.course
            ).prefetch_related(
                Prefetch(
                    "criterias",
                    queryset=Criteria.objects.filter(mode__in=[student.mode, "both"]),
                )
            )

            if user == student.supervisor:
                rubric_query = rubric_query.filter(pic__contains=["supervisor"])
            elif user in student.evaluators.all():
                rubric_query = rubric_query.filter(pic__contains=["examiner"])
            else:
                return Response(
                    {
                        "error": "User does not have permission to access this student's marking scheme"
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Order by steps
            rubrics = rubric_query.order_by("steps")
            serializer = RubricSerializer(rubrics, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetGradesView(APIView):
    def get(self, request, student_id):
        try:
            student = get_object_or_404(Student, id=student_id)
            user = request.user
            if not user.is_authenticated:
                return Response(
                    {"error": "User not authenticated"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            rubrics = Rubric.objects.filter(course=student.course).order_by("steps")
            result = []
            for rubric in rubrics:
                # Filter criteria by mode
                criteria_list = rubric.criterias.filter(
                    mode__in=[student.mode, "both"]
                ).order_by("id")
                # Fetch marks for the student, rubric, and authenticated user as evaluator
                marks = StudentMark.objects.filter(
                    student=student, criteria__rubric=rubric, evaluator=user
                ).order_by("criteria__id")

                # If marks exist, use them; otherwise, initialize with zeros
                if marks.exists():
                    grades = [mark.mark for mark in marks]
                else:
                    # Initialize grades with zeros for each criterion in the rubric
                    grades = [0] * criteria_list.count()

                result.append(
                    {"scheme": RubricSerializer(rubric).data, "grades": grades}
                )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SaveGradesView(APIView):
    def post(self, request, student_id):
        try:
            student = get_object_or_404(Student, id=student_id)
            user = get_object_or_404(User, id=request.data.get("user_id"))
            grades_data = request.data.get("grades", [])

            with transaction.atomic():
                # Delete existing marks only for the rubrics being updated
                rubric_ids = [grade_entry["scheme_id"] for grade_entry in grades_data]
                StudentMark.objects.filter(
                    student=student, evaluator=user, criteria__rubric__id__in=rubric_ids
                ).delete()

                # Save new marks
                for grade_entry in grades_data:
                    rubric = get_object_or_404(Rubric, id=grade_entry["scheme_id"])
                    criteria_list = rubric.criterias.filter(
                        mode__in=[student.mode, "both"]
                    ).order_by("id")
                    grades = grade_entry["grades"]

                    if len(grades) != len(criteria_list):
                        return Response(
                            {
                                "error": f"Invalid number of grades for rubric {rubric.label}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    for idx, (criteria, mark) in enumerate(zip(criteria_list, grades)):
                        if not (0 <= mark <= criteria.max_mark):
                            return Response(
                                {
                                    "error": f"Mark {mark} for {criteria.label} is out of range"
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                        # Save all marks, including zeros
                        StudentMark.objects.create(
                            student=student,
                            criteria=criteria,
                            evaluator=user,
                            mark=mark,
                        )

                # Calculate total_mark
                total_mark = 0
                rubrics = Rubric.objects.filter(course=student.course).order_by("steps")
                for rubric in rubrics:
                    criteria_list = rubric.criterias.filter(
                        mode__in=[student.mode, "both"]
                    ).order_by("id")
                    rubric_score = 0
                    for criteria in criteria_list:
                        # Get all marks for this criteria and student, excluding zeros
                        marks = StudentMark.objects.filter(
                            student=student, criteria=criteria
                        ).exclude(mark=0)
                        if marks.exists():
                            avg_mark = sum(mark.mark for mark in marks) / marks.count()
                            normalized_score = (
                                avg_mark / criteria.max_mark * criteria.weightage
                            ) / 100
                            rubric_score += normalized_score
                    # Apply rubric weightage (not divided by 100)
                    total_mark += rubric_score * rubric.weightage

                # Update or create StudentGrade
                student_grade, created = StudentGrade.objects.get_or_create(
                    student=student, defaults={"total_mark": total_mark}
                )
                if not created:
                    student_grade.total_mark = total_mark
                    student_grade.save()

            return Response(
                {"message": "Grades saved successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetAllTotalMarksView(APIView):
    def get(self, request):
        try:
            # Optimize query with select_related and prefetch_related
            grades = (
                StudentGrade.objects.select_related("student", "grade")
                .prefetch_related(
                    Prefetch(
                        "student__studentmark_set",
                        queryset=StudentMark.objects.select_related("criteria__rubric"),
                    )
                )
                .all()
            )

            print(f"Found {grades.count()} student grades")

            if not grades.exists():
                return Response([], status=status.HTTP_200_OK)

            serializer = TotalMarksSerializer(grades, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in GetAllTotalMarksView: {e}")
            return Response(
                {"error": f"Failed to fetch total marks: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetMarkingSchemeGradesView(APIView):
    def get(self, request):
        course = request.query_params.get("course", "")
        try:
            if course:
                rubrics = Rubric.objects.filter(course=course).order_by("steps")
                print(f"Found {rubrics.count()} rubrics for course {course}")
            else:
                rubrics = Rubric.objects.all().order_by("course", "steps")
                print(f"Found {rubrics.count()} total rubrics")

            serializer = MarkingSchemeSerializer(rubrics, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in GetMarkingSchemeGradesView: {e}")
            return Response(
                {"error": f"Failed to fetch marking schemes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
