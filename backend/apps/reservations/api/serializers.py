"""
Serializers for Reservations API.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.reservations.models import Reservation
from apps.reservations.services.states import get_reservation_state
from apps.rooms.api.serializers import RoomListSerializer
from apps.users.api.serializers import UserSerializer

User = get_user_model()


class ReservationListSerializer(serializers.ModelSerializer):
    """
    Serializer for Reservation list (lightweight).
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.CharField(source='get_status_display_color', read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_number', 'user_name', 'room_number', 'room_type',
            'check_in_date', 'check_out_date', 'duration_days', 'number_of_guests',
            'status', 'status_display', 'status_color', 'total_amount', 'created_at'
        ]


class ReservationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Reservation detail (full information).
    """
    user = UserSerializer(read_only=True)
    room = RoomListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.CharField(source='get_status_display_color', read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    can_check_in = serializers.BooleanField(read_only=True)
    can_check_out = serializers.BooleanField(read_only=True)
    available_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_number', 'user', 'room',
            'check_in_date', 'check_out_date', 'actual_check_in', 'actual_check_out',
            'number_of_guests', 'guest_name', 'guest_email', 'guest_phone',
            'price_per_night', 'total_nights', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'status', 'status_display',
            'status_color', 'special_requests', 'internal_notes',
            'cancellation_reason', 'cancelled_at', 'duration_days',
            'is_active', 'can_cancel', 'can_check_in', 'can_check_out',
            'available_actions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reservation_number', 'user', 'price_per_night',
            'total_nights', 'subtotal', 'tax_amount', 'total_amount',
            'actual_check_in', 'actual_check_out', 'cancelled_at',
            'created_at', 'updated_at'
        ]
    
    def get_available_actions(self, obj):
        """Get available actions based on state."""
        state = get_reservation_state(obj)
        return state.get_available_actions()


class ReservationCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new reservation.
    """
    room_id = serializers.UUIDField(required=True)
    check_in_date = serializers.DateField(required=True)
    check_out_date = serializers.DateField(required=True)
    number_of_guests = serializers.IntegerField(default=1, min_value=1)
    special_requests = serializers.CharField(required=False, allow_blank=True)
    guest_name = serializers.CharField(required=False, allow_blank=True, max_length=200)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    
    def validate(self, attrs):
        """Validate reservation data."""
        check_in = attrs['check_in_date']
        check_out = attrs['check_out_date']
        
        if check_out <= check_in:
            raise serializers.ValidationError({
                'check_out_date': 'La date de départ doit être après la date d\'arrivée.'
            })
        
        # Validate check-in is not in the past
        from datetime import date
        if check_in < date.today():
            raise serializers.ValidationError({
                'check_in_date': 'La date d\'arrivée ne peut pas être dans le passé.'
            })
        
        return attrs


class ReservationUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating reservation details.
    """
    special_requests = serializers.CharField(required=False, allow_blank=True)
    guest_name = serializers.CharField(required=False, allow_blank=True, max_length=200)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)


class CancelReservationSerializer(serializers.Serializer):
    """
    Serializer for cancelling a reservation.
    """
    reason = serializers.CharField(required=False, allow_blank=True)


class ApplyDiscountSerializer(serializers.Serializer):
    """
    Serializer for applying discount to reservation.
    """
    discount_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        required=True
    )
    reason = serializers.CharField(required=False, allow_blank=True)


class ReservationStatsSerializer(serializers.Serializer):
    """
    Serializer for reservation statistics.
    """
    total_reservations = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    checked_in = serializers.IntegerField()
    checked_out = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_stay = serializers.FloatField()
    by_status = serializers.ListField()