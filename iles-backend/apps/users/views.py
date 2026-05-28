from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from .models import User
from .serializers import UserCreateSerializer, UserSerializer
from apps.common.choices import ROLE_COORDINATOR, ROLE_ADMIN
from apps.common.permissions import IsAdmin


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['full_name', 'email', 'role']
    ordering_fields = ['id', 'full_name', 'email', 'role']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in (ROLE_COORDINATOR, ROLE_ADMIN):
            return User.objects.all().order_by('id')

    def create(self, request, *args, **kwargs):
        if request.user.role not in (ROLE_COORDINATOR, ROLE_ADMIN):
            return Response({'detail': 'Only administrators can create users.'}, status=403)
        return super().create(request, *args, **kwargs)
