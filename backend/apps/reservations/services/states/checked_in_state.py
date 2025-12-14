"""
Checked-In State - Guest is currently staying in the room.
"""
from .base_state import ReservationState
from django.core.exceptions import ValidationError


class CheckedInState(ReservationState):
    """
    State when guest has checked in.
    """
    
    def can_confirm(self):
        """Already confirmed and checked in."""
        return False
    
    def can_cancel(self):
        """Cannot cancel after check-in."""
        return False
    
    def can_check_in(self):
        """Already checked in."""
        return False
    
    def can_check_out(self):
        """Can perform check-out."""
        return True
    
    def can_modify(self):
        """Cannot modify dates after check-in."""
        return False
    
    def confirm(self):
        """Already confirmed."""
        raise ValidationError("La réservation est déjà confirmée et le check-in a été effectué.")
    
    def cancel(self, reason=None):
        """Cannot cancel after check-in."""
        raise ValidationError("Impossible d'annuler après le check-in. Effectuez plutôt un check-out.")
    
    def check_in(self):
        """Already checked in."""
        raise ValidationError("Le check-in a déjà été effectué.")
    
    def check_out(self):
        """
        Perform check-out.
        Transitions to CHECKED_OUT state.
        """
        from django.utils import timezone
        
        # Update reservation
        self.reservation.status = 'CHECKED_OUT'
        self.reservation.actual_check_out = timezone.now()
        self.reservation.save(update_fields=['status', 'actual_check_out', 'updated_at'])
        
        # Update room status - mark for cleaning
        self.reservation.room.mark_for_cleaning()
        
        return self.reservation