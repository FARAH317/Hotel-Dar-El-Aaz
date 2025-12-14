"""
Reservation Service Layer - Business logic for reservations.
Implements Unit of Work pattern for transactions.
"""
from django.db import transaction
from django.core.exceptions import ValidationError
from decimal import Decimal, ROUND_HALF_UP

from apps.reservations.models import Reservation
from apps.reservations.services.states import get_reservation_state
from apps.rooms.models import Room
from apps.notifications.services.notification_service import NotificationService

class ReservationService:
    """
    Service class handling reservation business logic.
    """
    
    TAX_RATE = Decimal('0.19')  # 19% TVA en Algérie
    @staticmethod
    def round_decimal(value):
       """Round decimal to 2 places."""
       return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @staticmethod
    @transaction.atomic
    def create_reservation(user, room_id, check_in_date, check_out_date, 
                          number_of_guests=1, special_requests='', **kwargs):
        """
        Create a new reservation with all validations.
        
        Args:
            user: User making the reservation
            room_id: UUID of the room
            check_in_date: Check-in date
            check_out_date: Check-out date
            number_of_guests: Number of guests
            special_requests: Special requests
            **kwargs: Additional guest info
        
        Returns:
            Reservation: Created reservation
        
        Raises:
            ValidationError: If validation fails
        """
        # Get room
        try:
            room = Room.objects.select_related('room_type').get(id=room_id)
        except Room.DoesNotExist:
            raise ValidationError("Chambre introuvable.")
        
        # Check room availability
        if not room.is_available:
            raise ValidationError("Cette chambre n'est pas disponible.")
        
        # Check for conflicts
        if Reservation.objects.has_conflict(room, check_in_date, check_out_date):
            raise ValidationError("La chambre n'est pas disponible pour ces dates.")
        
        # Validate guests
        if number_of_guests > room.room_type.max_occupancy:
            raise ValidationError(
                f"Le nombre d'invités ne peut pas dépasser {room.room_type.max_occupancy}."
            )
        
        # Calculate pricing
        price_per_night = room.current_price
        nights = (check_out_date - check_in_date).days
        # Calculate pricing
        price_per_night = room.current_price
        nights = (check_out_date - check_in_date).days
        subtotal = ReservationService.round_decimal(price_per_night * nights)
        tax_amount = ReservationService.round_decimal(subtotal * ReservationService.TAX_RATE)
        total_amount = ReservationService.round_decimal(subtotal + tax_amount)

        
        # Create reservation
        reservation = Reservation(
            user=user,
            room=room,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            number_of_guests=number_of_guests,
            special_requests=special_requests,
            price_per_night=price_per_night,
            total_nights=nights,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            guest_name=kwargs.get('guest_name', ''),
            guest_email=kwargs.get('guest_email', ''),
            guest_phone=kwargs.get('guest_phone', ''),
            status='PENDING'
        )
        
        # Validate and save
        reservation.full_clean()
        reservation.save()
        try:
            NotificationService.send_reservation_confirmation(reservation)
        except Exception as e:
            print(f"⚠️ Erreur lors de l'envoi de la notification: {e}")
        
        return reservation
    
    @staticmethod
    @transaction.atomic
    def confirm_reservation(reservation_id):
        """
        Confirm a pending reservation.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            Reservation: Confirmed reservation
        """
        reservation = Reservation.objects.get(id=reservation_id)
        
        if reservation.status != 'PENDING':
            raise ValidationError("Seules les réservations en attente peuvent être confirmées.")
        
        reservation.status = 'CONFIRMED'
        reservation.save(update_fields=['status', 'updated_at'])
        
        # ✅ Envoyer notification de confirmation
        try:
            NotificationService.send_reservation_confirmed(reservation)
        except Exception as e:
            print(f"⚠️ Erreur lors de l'envoi de la notification: {e}")
        
        return reservation

    
    @staticmethod
    @transaction.atomic
    def cancel_reservation(reservation_id, reason='', cancelled_by=None):
        """
        Cancel a reservation.
        
        Args:
            reservation_id: UUID of the reservation
            reason: Cancellation reason
        
        Returns:
            Reservation: Cancelled reservation
        """
        from django.utils import timezone
        
        reservation = Reservation.objects.get(id=reservation_id)
        
        if reservation.status not in ['PENDING', 'CONFIRMED']:
            raise ValidationError("Cette réservation ne peut pas être annulée.")
        
        # Check cancellation policy
        days_until_checkin = (reservation.check_in_date - date.today()).days
        if days_until_checkin < 0:
            raise ValidationError("Impossible d'annuler une réservation passée.")
        
        reservation.status = 'CANCELLED'
        reservation.cancellation_reason = reason
        reservation.cancelled_at = timezone.now()
        reservation.cancelled_by = cancelled_by
        reservation.save()
        
        # Free up the room
        if reservation.room:
            reservation.room.status = 'AVAILABLE'
            reservation.room.save(update_fields=['status', 'updated_at'])
        
        # ✅ Envoyer notification d'annulation
        try:
            NotificationService.send_reservation_cancelled(reservation)
        except Exception as e:
            print(f"⚠️ Erreur lors de l'envoi de la notification: {e}")
        
        return reservation
    
    @staticmethod
    @transaction.atomic
    def check_in_reservation(reservation_id):
        """
        Perform check-in for a reservation.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            Reservation: Checked-in reservation
        """
        reservation = Reservation.objects.select_related('room').get(id=reservation_id)
        state = get_reservation_state(reservation)
        
        return state.check_in()
    
    @staticmethod
    @transaction.atomic
    def check_out_reservation(reservation_id):
        """
        Perform check-out for a reservation.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            Reservation: Checked-out reservation
        """
        reservation = Reservation.objects.select_related('room').get(id=reservation_id)
        state = get_reservation_state(reservation)
        
        return state.check_out()
    
    @staticmethod
    @transaction.atomic
    def update_reservation(reservation_id, **update_data):
        """
        Update a reservation (only if modifiable).
        
        Args:
            reservation_id: UUID of the reservation
            **update_data: Fields to update
        
        Returns:
            Reservation: Updated reservation
        """
        reservation = Reservation.objects.select_related('room').get(id=reservation_id)
        state = get_reservation_state(reservation)
        
        if not state.can_modify():
            raise ValidationError("Cette réservation ne peut plus être modifiée.")
        
        # Update allowed fields
        allowed_fields = ['special_requests', 'guest_name', 'guest_email', 'guest_phone']
        
        for field, value in update_data.items():
            if field in allowed_fields:
                setattr(reservation, field, value)
        
        reservation.full_clean()
        reservation.save()
        
        return reservation
    
    @staticmethod
    def apply_discount(reservation_id, discount_amount, reason=''):
        """
        Apply a discount to a reservation.
        
        Args:
            reservation_id: UUID of the reservation
            discount_amount: Discount amount
            reason: Reason for discount
        
        Returns:
            Reservation: Updated reservation
        """
        reservation = Reservation.objects.get(id=reservation_id)
        
        if reservation.status not in ['PENDING', 'CONFIRMED']:
            raise ValidationError("Impossible d'appliquer une remise à cette réservation.")
        
        reservation.discount_amount = Decimal(str(discount_amount))
        reservation.internal_notes = f"{reservation.internal_notes}\nRemise: {reason}".strip()
        reservation.calculate_totals()
        reservation.save()
        
        return reservation
    
    @staticmethod
    def get_available_actions(reservation_id):
        """
        Get available actions for a reservation based on its state.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            list: Available actions
        """
        reservation = Reservation.objects.get(id=reservation_id)
        state = get_reservation_state(reservation)
        
        return state.get_available_actions()