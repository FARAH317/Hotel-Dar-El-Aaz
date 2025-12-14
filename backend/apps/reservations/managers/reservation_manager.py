"""
Custom manager for Reservation model - Repository Pattern.
"""
from django.db import models
from django.db.models import Q, Sum, Count, Avg
from datetime import date, timedelta


class ReservationManager(models.Manager):
    """
    Custom manager for Reservation with business logic methods.
    """
    
    def get_active_reservations(self):
        """Get all active reservations."""
        return self.filter(
            status__in=['CONFIRMED', 'CHECKED_IN']
        ).select_related('user', 'room', 'room__room_type')
    
    def get_upcoming_reservations(self, days=7):
        """Get upcoming reservations within specified days."""
        today = date.today()
        end_date = today + timedelta(days=days)
        
        return self.filter(
            status='CONFIRMED',
            check_in_date__gte=today,
            check_in_date__lte=end_date
        ).select_related('user', 'room')
    
    def get_todays_check_ins(self):
        """Get reservations checking in today."""
        today = date.today()
        return self.filter(
            status='CONFIRMED',
            check_in_date=today
        ).select_related('user', 'room')
    
    def get_todays_check_outs(self):
        """Get reservations checking out today."""
        today = date.today()
        return self.filter(
            status='CHECKED_IN',
            check_out_date=today
        ).select_related('user', 'room')
    
    def get_by_user(self, user):
        """Get all reservations for a specific user."""
        return self.filter(user=user).select_related('room', 'room__room_type')
    
    def get_by_room(self, room):
        """Get all reservations for a specific room."""
        return self.filter(room=room).select_related('user')
    
    def get_overlapping_reservations(self, room, check_in, check_out, exclude_id=None):
        """
        Check for overlapping reservations for a room.
        
        Args:
            room: Room instance
            check_in: Check-in date
            check_out: Check-out date
            exclude_id: Reservation ID to exclude (for updates)
        
        Returns:
            QuerySet of overlapping reservations
        """
        query = self.filter(
            room=room,
            status__in=['PENDING', 'CONFIRMED', 'CHECKED_IN']
        ).filter(
            Q(check_in_date__lt=check_out) & Q(check_out_date__gt=check_in)
        )
        
        if exclude_id:
            query = query.exclude(id=exclude_id)
        
        return query
    
    def has_conflict(self, room, check_in, check_out, exclude_id=None):
        """
        Check if there's a conflict for the given room and dates.
        
        Returns:
            bool: True if conflict exists
        """
        return self.get_overlapping_reservations(
            room, check_in, check_out, exclude_id
        ).exists()
    
    def get_statistics(self, start_date=None, end_date=None):
        """
        Get reservation statistics for a date range.
        
        Args:
            start_date: Start date for stats (default: 30 days ago)
            end_date: End date for stats (default: today)
        
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
            'total_reservations': queryset.count(),
            'confirmed': queryset.filter(status='CONFIRMED').count(),
            'checked_in': queryset.filter(status='CHECKED_IN').count(),
            'checked_out': queryset.filter(status='CHECKED_OUT').count(),
            'cancelled': queryset.filter(status='CANCELLED').count(),
            'total_revenue': queryset.filter(
                status__in=['CHECKED_OUT', 'CHECKED_IN']
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
            'average_stay': queryset.aggregate(avg=Avg('total_nights'))['avg'] or 0,
            'by_status': queryset.values('status').annotate(count=Count('id')),
        }
    
    def get_revenue_by_period(self, start_date, end_date):
        """
        Calculate total revenue for a period.
        """
        return self.filter(
            check_in_date__gte=start_date,
            check_out_date__lte=end_date,
            status__in=['CHECKED_OUT', 'CHECKED_IN']
        ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    def get_occupancy_rate(self, start_date, end_date):
        """
        Calculate occupancy rate for a period.
        """
        from apps.rooms.models import Room
        
        total_rooms = Room.objects.filter(is_active=True).count()
        if total_rooms == 0:
            return 0
        
        days = (end_date - start_date).days
        total_room_nights = total_rooms * days
        
        occupied_nights = self.filter(
            Q(check_in_date__lt=end_date) & Q(check_out_date__gt=start_date),
            status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
        ).aggregate(total=Sum('total_nights'))['total'] or 0
        
        return (occupied_nights / total_room_nights * 100) if total_room_nights > 0 else 0