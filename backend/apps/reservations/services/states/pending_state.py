"""
Pending State - Initial state of a reservation.
"""
from .base_state import ReservationState
from django.core.exceptions import ValidationError


class PendingState(ReservationState):
    """
    State when reservation is pending payment/confirmation.
    """
    
    def can_confirm(self):
        """Pending reservations can be confirmed."""
        return True
    
    def can_cancel(self):
        """Pending reservations can be cancelled."""
        return True
    
    def can_check_in(self):
        """Cannot check-in from pending state."""
        return False
    
    def can_check_out(self):
        """Cannot check-out from pending state."""
        return False
    
    def can_modify(self):
        """Pending reservations can be modified."""
        return True
    
    def confirm(self):
        """
        Confirm the reservation.
        Transitions to CONFIRMED state.
        """
        from datetime import date
        
        # Validate check-in date
        if self.reservation.check_in_date < date.today():
            raise ValidationError("Impossible de confirmer une réservation passée.")
        
        # Check room availability
        from apps.reservations.models import Reservation
        conflicts = Reservation.objects.has_conflict(
            self.reservation.room,
            self.reservation.check_in_date,
            self.reservation.check_out_date,
            exclude_id=self.reservation.id
        )
        
        if conflicts:
            raise ValidationError("La chambre n'est pas disponible pour ces dates.")
        
        # Update status
        self.reservation.status = 'CONFIRMED'
        self.reservation.save(update_fields=['status', 'updated_at'])
        
        # Update room status if check-in is today
        if self.reservation.check_in_date == date.today():
            self.reservation.room.mark_as_occupied()
        
        return self.reservation
    
    def cancel(self, reason=None):
        """
        Cancel the reservation.
        Transitions to CANCELLED state.
        """
        from django.utils import timezone
        
        self.reservation.status = 'CANCELLED'
        self.reservation.cancellation_reason = reason or ''
        self.reservation.cancelled_at = timezone.now()
        self.reservation.save(update_fields=[
            'status', 'cancellation_reason', 'cancelled_at', 'updated_at'
        ])
        
        return self.reservation
    
    def check_in(self):
        """Cannot check-in from pending state."""
        raise ValidationError("Impossible de faire le check-in. La réservation doit d'abord être confirmée.")
    
    def check_out(self):
        """Cannot check-out from pending state."""
        raise ValidationError("Impossible de faire le check-out depuis l'état en attente.")