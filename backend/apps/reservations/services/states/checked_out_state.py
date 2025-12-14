"""
Checked-Out State - Reservation is completed.
"""
from .base_state import ReservationState
from django.core.exceptions import ValidationError


class CheckedOutState(ReservationState):
    """
    Final state when guest has checked out.
    No further actions allowed.
    """
    
    def can_confirm(self):
        return False
    
    def can_cancel(self):
        return False
    
    def can_check_in(self):
        return False
    
    def can_check_out(self):
        return False
    
    def can_modify(self):
        return False
    
    def confirm(self):
        raise ValidationError("La réservation est déjà terminée.")
    
    def cancel(self, reason=None):
        raise ValidationError("Impossible d'annuler une réservation terminée.")
    
    def check_in(self):
        raise ValidationError("Le check-out a déjà été effectué.")
    
    def check_out(self):
        raise ValidationError("Le check-out a déjà été effectué.")