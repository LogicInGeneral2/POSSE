from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from grades.models import StudentGrade, StudentMark


@receiver(post_save, sender=StudentMark)
@receiver(post_delete, sender=StudentMark)
def update_student_grade(sender, instance, **kwargs):
    # Only recalculate if non-zero marks exist for the student
    if StudentMark.objects.filter(student=instance.student).exclude(mark=0).exists():
        student_grade, created = StudentGrade.objects.get_or_create(
            student=instance.student, defaults={"total_mark": 0}
        )
        student_grade.recalculate_total_mark()
    else:
        # Delete StudentGrade if no non-zero marks exist
        StudentGrade.objects.filter(student=instance.student).delete()
