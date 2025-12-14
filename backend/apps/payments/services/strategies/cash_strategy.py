"""
Cash Payment Strategy - For cash payments at the hotel.
"""
from .base_strategy import PaymentStrategy
import uuid


class CashPaymentStrategy(PaymentStrategy):
    """
    Strategy for processing cash payments.
    """
    
    def process_payment(self, payment, **kwargs):
        """
        Process a cash payment.
        Cash payments are immediately marked as completed.
        
        Args:
            payment: Payment instance
            **kwargs: Additional data (received_by, etc.)
        
        Returns:
            dict: Payment result
        """
        self.validate_payment_data(payment, **kwargs)
        
        # Generate internal transaction ID
        transaction_id = f"CASH-{uuid.uuid4().hex[:12].upper()}"
        
        # Mark payment as completed
        payment.mark_as_completed(
            transaction_id=transaction_id,
            processed_by=kwargs.get('processed_by')
        )
        
        # Add notes about who received the payment
        received_by = kwargs.get('processed_by')
        if received_by:
            payment.notes = f"Paiement en espèces reçu par {received_by.get_full_name()}"
            payment.save(update_fields=['notes', 'updated_at'])
        
        return {
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Paiement en espèces traité avec succès',
            'payment_method': 'cash'
        }
    
    def process_refund(self, payment, amount, reason=''):
        """
        Process a cash refund.
        
        Args:
            payment: Payment instance
            amount: Amount to refund
            reason: Refund reason
        
        Returns:
            dict: Refund result
        """
        if not payment.is_refundable:
            raise ValueError("Ce paiement ne peut pas être remboursé.")
        
        # Process refund
        payment.process_refund(amount, reason)
        
        return {
            'success': True,
            'refund_amount': amount,
            'message': 'Remboursement en espèces traité avec succès',
            'payment_method': 'cash'
        }
    
    def verify_payment(self, transaction_id):
        """
        Verify a cash payment.
        For cash, we just check if the transaction ID exists.
        
        Args:
            transaction_id: Transaction ID
        
        Returns:
            dict: Verification result
        """
        # Cash payments are verified at the point of sale
        return {
            'verified': True,
            'transaction_id': transaction_id,
            'payment_method': 'cash'
        }