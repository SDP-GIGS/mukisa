from rest_framework import serializers
from .models import User
from apps.common.choices import ROLE_LABELS, ROLE_STUDENT


class UserSerializer(serializers.ModelSerializer):
    role_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'role_label', 'student_number', 'staff_number',
            'department', 'phone', 'is_active',
        ]

    def get_role_label(self, obj):
        return ROLE_LABELS.get(obj.role, obj.role)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # The frontend sends `full_name` directly; first/last names are optional.
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'password',
            'student_number', 'staff_number', 'department', 'phone',
        ]
        extra_kwargs = {
            'role': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')

        # Auto-generate a username from the email local-part if none supplied.
        base = validated_data['email'].split('@')[0]
        username = base
        suffix = 1
        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f'{base}{suffix}'
        validated_data['username'] = username

        # Default role to student if not provided.
        if not validated_data.get('role'):
            validated_data['role'] = ROLE_STUDENT

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user