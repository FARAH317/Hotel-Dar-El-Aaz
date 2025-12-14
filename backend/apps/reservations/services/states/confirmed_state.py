"""
Confirmed State - Reservation is confirmed and waiting for check-in.
"""
from .base_state import ReservationState
from django.core.exceptions import ValidationError
from datetime import date


class ConfirmedState(ReservationState):
    """
    State when reservation is confirmed.
    """
    
    def can_confirm(self):
        """Already confirmed."""
        return False
    
    def can_cancel(self):
        """Confirmed reservations can be cancelled."""
        return True
    
    def can_check_in(self):
        """Can check-in if date is today or past."""
        return self.reservation.check_in_date <= date.today()
    
    def can_check_out(self):
        """Cannot check-out before check-in."""
        return False
    
    def can_modify(self):
        """Confirmed reservations can be modified with restrictions."""
        return self.reservation.check_in_date > date.today()
    
    def confirm(self):
        """Already confirmed."""
        raise ValidationError("La réservation est déjà confirmée.")
    
    def cancel(self, reason=None):
        """
        Cancel the reservation.
        Transitions to CANCELLED state.
        """
        from django.utils import timezone
        
        # Check cancellation policy (can add time restrictions here)
        days_until_checkin = (self.reservation.check_in_date - date.today()).days
        
        self.reservation.status = 'CANCELLED'
        self.reservation.cancellation_reason = reason or ''
        self.reservation.cancelled_at = timezone.now()
        self.reservation.save(update_fields=[
            'status', 'cancellation_reason', 'cancelled_at', 'updated_at'
        ])
        
        # Make room available again
        if self.reservation.room.status == 'OCCUPIED':
            self.reservation.room.mark_as_available()
        
        return self.reservation
    
    def check_in(self):
        """
        Perform check-in.
        Transitions to CHECKED_IN state.
        """
        from django.utils import timezone
        
        # Validate check-in date
        if self.reservation.check_in_date > date.today():
            raise ValidationError("Le check-in ne peut pas être effectué avant la date prévue.")
        
        # Update reservation
        self.reservation.status = 'CHECKED_IN'
        self.reservation.actual_check_in = timezone.now()
        self.reservation.save(update_fields=['status', 'actual_check_in', 'updated_at'])
        
        # Update room status
        self.reservation.room.mark_as_occupied()
        
        return self.reservation
    
    def check_out(self):
        """Cannot check-out before check-in."""
        raise ValidationError("Impossible de faire le check-out. Le check-in n'a pas encore été effectué.")