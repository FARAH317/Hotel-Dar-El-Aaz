"""
PayPal Payment Strategy - For PayPal payments.
"""
from .base_strategy import PaymentStrategy


class PayPalPaymentStrategy(PaymentStrategy):
    """
    Strategy for processing payments via PayPal.
    Note: This is a simplified implementation.
    For production, use PayPal SDK.
    """
    
    def process_payment(self, payment, **kwargs):
        """
        Process a PayPal payment.
        
        Args:
            payment: Payment instance
            **kwargs: Must include 'paypal_order_id' or 'authorization_id'
        
        Returns:
            dict: Payment result
        """
        self.validate_payment_data(payment, **kwargs)
        
        order_id = kwargs.get('paypal_order_id')
        authorization_id = kwargs.get('authorization_id')
        
        if not order_id and not authorization_id:
            raise ValueError("PayPal order_id ou authorization_id requis")
        
        # In production, capture the payment using PayPal SDK
        # For now, we'll simulate it
        
        transaction_id = order_id or authorization_id
        
        # Store PayPal response
        gateway_response = {
            'order_id': order_id,
            'authorization_id': authorization_id,
            'status': 'COMPLETED',
            'payer_email': kwargs.get('payer_email', ''),
        }
        
        payment.transaction_id = transaction_id
        payment.payment_gateway_response = gateway_response
        payment.mark_as_completed(transaction_id=transaction_id)
        
        return {
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Paiement PayPal traité avec succès',
            'payment_method': 'paypal',
            'gateway_response': gateway_response
        }
    
    def process_refund(self, payment, amount, reason=''):
        """
        Process a PayPal refund.
        
        Args:
            payment: Payment instance
            amount: Amount to refund
            reason: Refund reason
        
        Returns:
            dict: Refund result
        """
        if not payment.is_refundable:
            raise ValueError("Ce paiement ne peut pas être remboursé.")
        
        # In production, process refund via PayPal SDK
        # For now, we'll simulate it
        
        payment.process_refund(amount, reason)
        
        return {
            'success': True,
            'refund_amount': amount,
            'message': 'Remboursement PayPal traité avec succès',
            'payment_method': 'paypal'
        }
    
    def verify_payment(self, transaction_id):
        """
        Verify a PayPal payment.
        
        Args:
            transaction_id: PayPal transaction ID
        
        Returns:
            dict: Verification result
        """
        # In production, verify via PayPal API
        # For now, we'll simulate it
        
        return {
            'verified': True,
            'transaction_id': transaction_id,
            'status': 'COMPLETED',
            'payment_method': 'paypal'
        }