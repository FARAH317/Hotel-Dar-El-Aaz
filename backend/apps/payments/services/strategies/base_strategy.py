"""
Base Payment Strategy - Strategy Pattern.
"""
from abc import ABC, abstractmethod


class PaymentStrategy(ABC):
    """
    Abstract base class for payment strategies.
    Each payment method implements its own strategy.
    """
    
    @abstractmethod
    def process_payment(self, payment, **kwargs):
        """
        Process a payment.
        
        Args:
            payment: Payment instance
            **kwargs: Additional payment data
        
        Returns:
            dict: Payment result with status and transaction_id
        
        Raises:
            Exception: If payment fails
        """
        pass
    
    @abstractmethod
    def process_refund(self, payment, amount, reason=''):
        """
        Process a refund.
        
        Args:
            payment: Payment instance
            amount: Amount to refund
            reason: Refund reason
        
        Returns:
            dict: Refund result
        
        Raises:
            Exception: If refund fails
        """
        pass
    
    @abstractmethod
    def verify_payment(self, transaction_id):
        """
        Verify a payment transaction.
        
        Args:
            transaction_id: External transaction ID
        
        Returns:
            dict: Payment verification result
        """
        pass
    
    def validate_payment_data(self, payment, **kwargs):
        """
        Validate payment data before processing.
        Override in subclasses if needed.
        
        Args:
            payment: Payment instance
            **kwargs: Additional payment data
        
        Returns:
            bool: True if valid
        
        Raises:
            ValueError: If validation fails
        """
        if payment.amount <= 0:
            raise ValueError("Le montant du paiement doit être positif.")
        
        return True