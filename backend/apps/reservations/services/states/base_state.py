"""
Base State class for Reservation State Pattern.
"""
from abc import ABC, abstractmethod


class ReservationState(ABC):
    """
    Abstract base class for reservation states.
    Each state defines what actions are allowed.
    """
    
    def __init__(self, reservation):
        self.reservation = reservation
    
    @abstractmethod
    def can_confirm(self):
        """Check if reservation can be confirmed."""
        pass
    
    @abstractmethod
    def can_cancel(self):
        """Check if reservation can be cancelled."""
        pass
    
    @abstractmethod
    def can_check_in(self):
        """Check if check-in is allowed."""
        pass
    
    @abstractmethod
    def can_check_out(self):
        """Check if check-out is allowed."""
        pass
    
    @abstractmethod
    def can_modify(self):
        """Check if reservation can be modified."""
        pass
    
    @abstractmethod
    def confirm(self):
        """Confirm the reservation."""
        pass
    
    @abstractmethod
    def cancel(self, reason=None):
        """Cancel the reservation."""
        pass
    
    @abstractmethod
    def check_in(self):
        """Perform check-in."""
        pass
    
    @abstractmethod
    def check_out(self):
        """Perform check-out."""
        pass
    
    def get_available_actions(self):
        """Get list of available actions for this state."""
        actions = []
        if self.can_confirm():
            actions.append('confirm')
        if self.can_cancel():
            actions.append('cancel')
        if self.can_check_in():
            actions.append('check_in')
        if self.can_check_out():
            actions.append('check_out')
        if self.can_modify():
            actions.append('modify')
        return actions