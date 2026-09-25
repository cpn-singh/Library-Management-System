from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)
    phone = serializers.CharField(source='phone_number', read_only=True)
    membershipId = serializers.CharField(source='membership_id', read_only=True)
    membershipTier = serializers.CharField(source='membership_tier', read_only=True)
    joinedDate = serializers.DateTimeField(source='date_joined', format='%Y-%m-%d', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'name', 'first_name', 'last_name',
            'role', 'status', 'membership_id', 'membershipId',
            'membership_tier', 'membershipTier', 'avatar',
            'phone_number', 'phone', 'address', 'is_librarian',
            'is_member', 'joinedDate'
        ]

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['member', 'librarian'], default='member')
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    membershipTier = serializers.CharField(max_length=50, required=False, default='Standard Reader')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        name = validated_data['name']
        email = validated_data['email'].lower()
        password = validated_data['password']
        role = 'member'  # Patron self-registration only; librarians are added via Django Admin
        phone = validated_data.get('phone', '')
        membership_tier = validated_data.get('membershipTier', 'Standard Reader')

        parts = name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        import random
        random_num = random.randint(1000, 9999)
        membership_id = f"STAFF-{random_num}" if role == 'librarian' else f"ATH-{random_num}"
        avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" if role == 'librarian' else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_librarian=(role == 'librarian'),
            is_staff=(role == 'librarian'),
            is_member=(role == 'member'),
            status='active',
            membership_id=membership_id,
            membership_tier=membership_tier if role == 'member' else 'Staff Administrator',
            avatar=avatar,
            phone_number=phone
        )
        return user
