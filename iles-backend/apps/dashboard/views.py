from django.db.models import Avg
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import User
from apps.placements.models import InternshipPlacement
from apps.logs.models import WeeklyLog
from apps.evaluations.models import Evaluation
from apps.common.choices import (
    ROLE_STUDENT, ROLE_WORKPLACE_SUPERVISOR,
    ROLE_ACADEMIC_SUPERVISOR, ROLE_ADMIN,
)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == ROLE_STUDENT:
            return Response(self._student(user))
        elif user.role == ROLE_WORKPLACE_SUPERVISOR:
            return Response(self._workplace(user))
        elif user.role == ROLE_ACADEMIC_SUPERVISOR:
            return Response(self._academic(user))
        elif user.role == ROLE_ADMIN:
            return Response(self._admin(user))
        # fallback for legacy roles
        return Response(self._admin(user))

    # ── Student ───────────────────────────────────────────────────────────
    def _student(self, user):
        logs = WeeklyLog.objects.filter(student=user)
        evaluations = Evaluation.objects.filter(weekly_log__student=user)
        has_placement = InternshipPlacement.objects.filter(student=user).exists()
        avg = evaluations.aggregate(a=Avg('total_score'))['a']

        log_counts = {
            'draft':     logs.filter(status='draft').count(),
            'submitted': logs.filter(status='submitted').count(),
            'reviewed':  logs.filter(status='reviewed').count(),
            'approved':  logs.filter(status='approved').count(),
            'rejected':  logs.filter(status='rejected').count(),
        }

        recent = logs.order_by('-created_at')[:5].values(
            'id', 'week_number', 'title', 'status', 'submitted_at'
        )

        return {
            'role': 'student',
            'total_logs': logs.count(),
            'log_counts': log_counts,
            'recent_logs': list(recent),
            'has_placement': has_placement,
            'average_score': float(avg) if avg else None,
        }

    # ── Workplace supervisor ──────────────────────────────────────────────
    def _workplace(self, user):
        placements = InternshipPlacement.objects.filter(workplace_supervisor=user)
        student_ids = placements.values_list('student_id', flat=True)
        logs = WeeklyLog.objects.filter(student_id__in=student_ids)

        awaiting = logs.filter(status='submitted')
        recent_subs = awaiting.order_by('-submitted_at')[:5].values(
            'id', 'week_number', 'student__full_name', 'submitted_at', 'title'
        )

        log_counts = {
            'submitted': awaiting.count(),
            'reviewed':  logs.filter(status='reviewed').count(),
            'approved':  logs.filter(status='approved').count(),
            'rejected':  logs.filter(status='rejected').count(),
        }

        return {
            'role': 'workplace_supervisor',
            'students_supervised': placements.count(),
            'awaiting_review': awaiting.count(),
            'log_counts': log_counts,
            'recent_submissions': list(recent_subs),
        }

    # ── Academic supervisor ───────────────────────────────────────────────
    def _academic(self, user):
        placements = InternshipPlacement.objects.filter(academic_supervisor=user)
        student_ids = placements.values_list('student_id', flat=True)
        logs = WeeklyLog.objects.filter(student_id__in=student_ids)
        evals = Evaluation.objects.filter(evaluator=user)
        avg = evals.aggregate(a=Avg('total_score'))['a']

        to_approve = logs.filter(status='reviewed').order_by('-reviewed_at')[:5].values(
            'id', 'week_number', 'student__full_name', 'reviewed_at', 'title'
        )

        return {
            'role': 'academic_supervisor',
            'students_supervised': placements.count(),
            'awaiting_approval': logs.filter(status='reviewed').count(),
            'evaluations_given': evals.count(),
            'average_score_given': float(avg) if avg else None,
            'to_approve': list(to_approve),
        }

    # ── Admin ─────────────────────────────────────────────────────────────
    def _admin(self, user):
        all_logs = WeeklyLog.objects.all()
        evals = Evaluation.objects.all()
        avg = evals.aggregate(a=Avg('total_score'))['a']

        user_counts = {}
        for role in [ROLE_STUDENT, ROLE_WORKPLACE_SUPERVISOR,
                     ROLE_ACADEMIC_SUPERVISOR, ROLE_ADMIN]:
            user_counts[role] = User.objects.filter(role=role).count()

        log_counts = {
            'draft':     all_logs.filter(status='draft').count(),
            'submitted': all_logs.filter(status='submitted').count(),
            'reviewed':  all_logs.filter(status='reviewed').count(),
            'approved':  all_logs.filter(status='approved').count(),
            'rejected':  all_logs.filter(status='rejected').count(),
        }

        return {
            'role': 'admin',
            'user_counts': user_counts,
            'total_placements': InternshipPlacement.objects.count(),
            'active_placements': InternshipPlacement.objects.filter(
                status='active'
            ).count(),
            'log_counts': log_counts,
            'average_score': float(avg) if avg else None,
            'overdue_submissions': 0,
        }
