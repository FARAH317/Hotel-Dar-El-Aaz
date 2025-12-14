"""
Custom manager for Payment model - Repository Pattern.
"""
from django.db import models
from django.db.models import Sum, Count, Avg
from datetime import date, timedelta


class PaymentManager(models.Manager):
    """
    Custom manager for Payment with business logic methods.
    """
    
    def get_successful_payments(self):
        """Get all successful payments."""
        return self.filter(status='COMPLETED').select_related('user', 'reservation')
    
    def get_pending_payments(self):
        """Get all pending payments."""
        return self.filter(status='PENDING').select_related('user', 'reservation')
    
    def get_by_user(self, user):
        """Get all payments for a specific user."""
        return self.filter(user=user).select_related('reservation', 'reservation__room')
    
    def get_by_reservation(self, reservation):
        """Get all payments for a specific reservation."""
        return self.filter(reservation=reservation).order_by('-created_at')
    
    def get_by_method(self, payment_method):
        """Get payments by payment method."""
        return self.filter(payment_method=payment_method)
    
    def get_total_revenue(self, start_date=None, end_date=None):
        """
        Calculate total revenue for a period.
        
        Args:
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: today)
        
        Returns:
            Decimal: Total revenue
        """
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        result = self.filter(
            status='COMPLETED',
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).aggregate(total=Sum('amount'))
        
        return result['total'] or 0
    
    def get_statistics(self, start_date=None, end_date=None):
        """
        Get payment statistics for a date range.
        
        Args:
            start_date: Start date
            end_date: End date
        
        Returns:
            dict: Statistics data
        """
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        queryset = self.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        return {
            'total_payments': queryset.count(),
            'successful': queryset.filter(status='COMPLETED').count(),
            'pending': queryset.filter(status='PENDING').count(),
            'failed': queryset.filter(status='FAILED').count(),
            'refunded': queryset.filter(status='REFUNDED').count(),
            'total_amount': queryset.filter(status='COMPLETED').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'total_refunded': queryset.aggregate(
                total=Sum('refunded_amount')
            )['total'] or 0,
            'average_payment': queryset.filter(status='COMPLETED').aggregate(
                avg=Avg('amount')
            )['avg'] or 0,
            'by_method': queryset.values('payment_method').annotate(
                count=Count('id'),
                total=Sum('amount')
            ),
            'by_status': queryset.values('status').annotate(count=Count('id')),
        }
    
    def get_reservation_payment_status(self, reservation):
        """
        Get payment status for a reservation.
        
        Returns:
            dict: Payment status information
        """
        payments = self.get_by_reservation(reservation)
        
        total_paid = payments.filter(status='COMPLETED').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_pending = payments.filter(status='PENDING').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return {
            'total_paid': total_paid,
            'total_pending': total_pending,
            'balance_due': reservation.total_amount - total_paid,
            'is_fully_paid': total_paid >= reservation.total_amount,
            'payments_count': payments.count(),
        }