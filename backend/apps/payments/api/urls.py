"""
URL configuration for Payments API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InvoiceViewSet

app_name = 'payments'

# Create router
router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'invoices', InvoiceViewSet, basename='invoices')

urlpatterns = [
    path('', include(router.urls)),
]