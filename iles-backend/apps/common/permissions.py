"""Reusable DRF permission classes for role-based access control.

These make role checks declarative — a view lists what it requires
(e.g. permission_classes = [IsAuthenticated, IsAdmin]) instead of
scattering `if user.role == ...` through the code.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.common.choices import (
    ROLE_ADMIN,
    ROLE_COORDINATOR,
    ROLE_STUDENT,
    ROLE_SUPERVISOR,
    ROLE_WORKPLACE_SUPERVISOR,
    ROLE_ACADEMIC_SUPERVISOR,
)

# Roles that act as administrators (new label + legacy label).
ADMIN_ROLES = (ROLE_ADMIN, ROLE_COORDINATOR)

# Roles that can review/approve logs (new labels + legacy label).
SUPERVISOR_ROLES = (
    ROLE_WORKPLACE_SUPERVISOR,
    ROLE_ACADEMIC_SUPERVISOR,
    ROLE_SUPERVISOR,
    ROLE_ADMIN,
    ROLE_COORDINATOR,
)


class IsAdmin(BasePermission):
    """Allow only administrators (admin / coordinator)."""
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ADMIN_ROLES
        )


class IsStudent(BasePermission):
    message = "Only students can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == ROLE_STUDENT
        )


class IsSupervisor(BasePermission):
    """Allow workplace/academic supervisors and administrators."""
    message = "Only supervisors can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in SUPERVISOR_ROLES
        )


class IsAdminOrReadOnly(BasePermission):
    """Anyone authenticated can read; only admins can write."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ADMIN_ROLES