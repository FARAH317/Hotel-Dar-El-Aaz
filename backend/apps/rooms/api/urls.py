"""
URL configuration for Rooms API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomTypeViewSet, AmenityViewSet

app_name = 'rooms'

# Create router
router = DefaultRouter()
router.register(r'room-types', RoomTypeViewSet, basename='room-types')
router.register(r'amenities', AmenityViewSet, basename='amenities')
router.register(r'rooms', RoomViewSet, basename='rooms')

urlpatterns = [
    path('', include(router.urls)),
]