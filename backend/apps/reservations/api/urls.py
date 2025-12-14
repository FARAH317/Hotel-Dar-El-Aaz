"""
URL configuration for Reservations API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet

app_name = 'reservations'

# Create router
router = DefaultRouter()
router.register(r'reservations', ReservationViewSet, basename='reservations')

urlpatterns = [
    path('', include(router.urls)),
]