from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    data = request.data
    email_or_username = data.get('email', '').strip()
    password = data.get('password', '')

    if not email_or_username or not password:
        return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    # Try finding user by email
    try:
        user_obj = User.objects.get(email__iexact=email_or_username)
        user = authenticate(request, username=user_obj.username, password=password)
    except User.DoesNotExist:
        # Fallback: try finding by username
        user = authenticate(request, username=email_or_username, password=password)

    if user is None:
        return Response({'detail': 'Invalid email/username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.status == 'suspended':
        return Response({'detail': 'This account has been suspended. Please speak with library administration.'}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_current_user(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'detail': 'Not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_user_list(request):
    users = User.objects.all().order_by('id')
    return Response(UserSerializer(users, many=True).data)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def api_update_user_status(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['active', 'suspended', 'inactive']:
        return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

    user.status = new_status
    user.save()
    return Response(UserSerializer(user).data)