from rest_framework import permissions, viewsets
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer
from apps.common.choices import ROLE_STUDENT


class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Students only see their own placement; others see all.
        if user.role == ROLE_STUDENT:
            return qs.filter(student=user)
        return qs