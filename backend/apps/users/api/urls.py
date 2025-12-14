"""
URL configuration for Users API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AuthViewSet, UserViewSet

app_name = 'users'

# Create router
router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # JWT Token Refresh
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]