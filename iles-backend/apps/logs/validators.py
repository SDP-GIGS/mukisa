from django.utils import timezone
from rest_framework.exceptions import ValidationError

VALID_TRANSITIONS = {
    'draft':     {'submitted'},
    'submitted': {'reviewed', 'rejected'},
    'reviewed':  {'approved', 'draft', 'rejected'},
    'approved':  set(),                  # terminal — cannot change
    'rejected':  {'draft'},              # student can fix and resubmit
}


def validate_transition(current_status, new_status):
    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise ValidationError(
            {'detail': f'Cannot move from "{current_status}" to "{new_status}".'}
        )


def validate_deadline(deadline):
    if timezone.localdate() > deadline:
        raise ValidationError({'detail': 'Submission deadline has passed.'})
