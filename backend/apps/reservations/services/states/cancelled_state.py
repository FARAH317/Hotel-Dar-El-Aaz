"""
Cancelled State - Reservation was cancelled.
"""
from .base_state import ReservationState
from django.core.exceptions import ValidationError


class CancelledState(ReservationState):
    """
    Final state when reservation is cancelled.
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
        raise ValidationError("Impossible de confirmer une réservation annulée.")
    
    def cancel(self, reason=None):
        raise ValidationError("La réservation est déjà annulée.")
    
    def check_in(self):
        raise ValidationError("Impossible de faire le check-in d'une réservation annulée.")
    
    def check_out(self):
        raise ValidationError("Impossible de faire le check-out d'une réservation annulée.")