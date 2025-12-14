"""
Custom manager for Room model - Repository Pattern.
"""
from django.db import models
from django.db.models import Q, Count
from datetime import date


class RoomManager(models.Manager):
    """
    Custom manager for Room with business logic methods.
    """

    def get_active_rooms(self):
        """
        Get all active rooms.
        """
        return self.filter(is_active=True)

    def get_available_rooms(self):
        """
        Get all available rooms (active and status = AVAILABLE).
        """
        return self.filter(
            is_active=True,
            status='AVAILABLE'
        ).select_related('room_type').prefetch_related('amenities')

    def get_by_type(self, room_type_id):
        """
        Get rooms by type.
        """
        return self.filter(room_type_id=room_type_id, is_active=True)

    def get_by_floor(self, floor):
        """
        Get rooms by floor.
        """
        return self.filter(floor=floor, is_active=True)

    def search_rooms(self, **filters):

        # ✅ Commencer avec la méthode pour les dates si présentes
        check_in = filters.pop('check_in', None)
        check_out = filters.pop('check_out', None)
    
        if check_in and check_out:
           queryset = self.get_available_for_dates(check_in, check_out)
        else:
           queryset = self.get_available_rooms()

        # Reste des filtres...
        room_type_id = filters.get('room_type_id')
        if room_type_id:
           print(f"🔍 Filtrage par type: {room_type_id}")
           queryset = queryset.filter(room_type_id=room_type_id)
           print(f"✅ Après filtre type: {queryset.count()}")
        min_price = filters.get('min_price')
        if min_price not in [None, '']:
           queryset = queryset.filter(
              Q(custom_price__gte=min_price) |
              Q(custom_price__isnull=True, room_type__base_price__gte=min_price)
            )

        max_price = filters.get('max_price')
        if max_price not in [None, '']:
            queryset = queryset.filter(
               Q(custom_price__lte=max_price) |
               Q(custom_price__isnull=True, room_type__base_price__lte=max_price)
            )

        amenities = filters.get('amenities')
        if amenities:
           for amenity_id in amenities:
              queryset = queryset.filter(amenities__id=amenity_id)

        floor = filters.get('floor')
        if floor not in [None, '']:
            queryset = queryset.filter(floor=floor)

        view_type = filters.get('view_type')
        if view_type:
           queryset = queryset.filter(view_type__icontains=view_type)

        return queryset.distinct()


    def get_available_for_dates(self, check_in, check_out):
        """
        Get rooms available for specific dates.
        
        Args:
            check_in: Check-in date
            check_out: Check-out date
        
        Returns:
            QuerySet of available rooms
        """
        from apps.reservations.models import Reservation

        # Get rooms with overlapping reservations
        occupied_rooms = Reservation.objects.filter(
            Q(check_in_date__lt=check_out) & Q(check_out_date__gt=check_in),
            status__in=['CONFIRMED', 'CHECKED_IN']
        ).values_list('room_id', flat=True)

        # Return available rooms (not in occupied list)
        return self.get_available_rooms().exclude(id__in=occupied_rooms)

    def get_statistics(self):
        """
        Get room statistics.
        """
        return {
            'total': self.count(),
            'active': self.filter(is_active=True).count(),
            'available': self.filter(status='AVAILABLE', is_active=True).count(),
            'occupied': self.filter(status='OCCUPIED').count(),
            'maintenance': self.filter(status='MAINTENANCE').count(),
            'cleaning': self.filter(status='CLEANING').count(),
            'by_type': self.values('room_type__name').annotate(count=Count('id')),
        }
