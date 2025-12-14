"""
API Views for User management and authentication.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
 
)

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet for authentication operations.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        """
        Register a new user.
        
        POST /api/auth/register/
        """
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Utilisateur créé avec succès',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        """
        Login user and return JWT tokens.
        
        POST /api/auth/login/
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Email ou mot de passe incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.check_password(password):
            return Response(
                {'error': 'Email ou mot de passe incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Ce compte est désactivé'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Connexion réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='logout', permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout user by blacklisting refresh token.
        
        POST /api/auth/logout/
        """
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {'message': 'Déconnexion réussie'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Token invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on user role.
        """
        user = self.request.user
        
        # Admin can see all users
        if user.is_admin or user.is_staff:
            return User.objects.all()
        
        # Regular users can only see themselves
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Get current user profile.
        
        GET /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], url_path='me/update')
    def update_me(self, request):
        """
        Update current user profile.
        
        PUT/PATCH /api/users/me/update/
        """
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': UserSerializer(request.user).data
        })
    
    @action(detail=False, methods=['post'], url_path='me/change-password')
    def change_password(self, request):
        """
        Change current user password.
        
        POST /api/users/me/change-password/
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Update password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Mot de passe modifié avec succès'
        }, status=status.HTTP_200_OK)