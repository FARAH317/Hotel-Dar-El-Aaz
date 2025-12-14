"""
Reservation State Pattern implementation.
"""
from .base_state import ReservationState
from .pending_state import PendingState
from .confirmed_state import ConfirmedState
from .checked_in_state import CheckedInState
from .checked_out_state import CheckedOutState
from .cancelled_state import CancelledState


# State factory
def get_reservation_state(reservation):
    """
    Factory function to get the appropriate state for a reservation.
    
    Args:
        reservation: Reservation instance
    
    Returns:
        ReservationState: Appropriate state instance
    """
    states = {
        'PENDING': PendingState,
        'CONFIRMED': ConfirmedState,
        'CHECKED_IN': CheckedInState,
        'CHECKED_OUT': CheckedOutState,
        'CANCELLED': CancelledState,
        'NO_SHOW': CancelledState,  # Treat NO_SHOW like CANCELLED
    }
    
    state_class = states.get(reservation.status)
    if not state_class:
        raise ValueError(f"Unknown reservation status: {reservation.status}")
    
    return state_class(reservation)


__all__ = [
    'ReservationState',
    'PendingState',
    'ConfirmedState',
    'CheckedInState',
    'CheckedOutState',
    'CancelledState',
    'get_reservation_state',
]