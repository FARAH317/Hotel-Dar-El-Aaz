"""
URL configuration for Notifications API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

app_name = 'notifications'

# Create router
router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]