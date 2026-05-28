from decimal import Decimal

# Weights per CSC 1202 Lecture 1: Total = T*0.4 + C*0.3 + P*0.3
TECHNICAL_WEIGHT = Decimal('0.40')
COMMUNICATION_WEIGHT = Decimal('0.30')
PROFESSIONALISM_WEIGHT = Decimal('0.30')

WEIGHTS = {
    'technical_skills': TECHNICAL_WEIGHT,
    'communication': COMMUNICATION_WEIGHT,
    'professionalism': PROFESSIONALISM_WEIGHT,
}

# Guard against misconfiguration — weights must sum to exactly 1.00.
assert sum(WEIGHTS.values()) == Decimal('1.00'), 'Evaluation weights must sum to 1.00'


def calculate_total_score(technical_skills, communication, professionalism):
    return (
        Decimal(technical_skills) * TECHNICAL_WEIGHT +
        Decimal(communication) * COMMUNICATION_WEIGHT +
        Decimal(professionalism) * PROFESSIONALISM_WEIGHT
    )