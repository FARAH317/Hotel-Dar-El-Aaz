"""
Stripe Payment Strategy - For credit card payments via Stripe.
"""
from .base_strategy import PaymentStrategy
from django.conf import settings
import stripe


class StripePaymentStrategy(PaymentStrategy):
    """
    Strategy for processing payments via Stripe.
    """
    
    def __init__(self):
        """Initialize Stripe with API key."""
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def process_payment(self, payment, **kwargs):
        """
        Process a Stripe payment.
        
        Args:
            payment: Payment instance
            **kwargs: Must include 'payment_method_id' or 'token'
        
        Returns:
            dict: Payment result
        
        Raises:
            Exception: If payment fails
        """
        self.validate_payment_data(payment, **kwargs)
        
        payment_method_id = kwargs.get('payment_method_id')
        token = kwargs.get('token')
        
        if not payment_method_id and not token:
            raise ValueError("payment_method_id ou token requis pour Stripe")
        
        try:
            # Convert amount to cents (Stripe uses smallest currency unit)
            amount_cents = int(payment.amount * 100)
            
            # Create payment intent or charge
            if payment_method_id:
                intent = stripe.PaymentIntent.create(
                    amount=amount_cents,
                    currency=payment.currency.lower(),
                    payment_method=payment_method_id,
                    confirm=True,
                    description=f"Réservation {payment.reservation.reservation_number}",
                    metadata={
                        'reservation_id': str(payment.reservation.id),
                        'payment_id': str(payment.id),
                        'user_email': payment.user.email,
                    }
                )
                
                transaction_id = intent.id
                gateway_response = {
                    'id': intent.id,
                    'status': intent.status,
                    'amount': intent.amount,
                    'currency': intent.currency,
                }
            
            else:  # Use token
                charge = stripe.Charge.create(
                    amount=amount_cents,
                    currency=payment.currency.lower(),
                    source=token,
                    description=f"Réservation {payment.reservation.reservation_number}",
                    metadata={
                        'reservation_id': str(payment.reservation.id),
                        'payment_id': str(payment.id),
                    }
                )
                
                transaction_id = charge.id
                gateway_response = {
                    'id': charge.id,
                    'status': charge.status,
                    'amount': charge.amount,
                    'currency': charge.currency,
                }
            
            # Mark payment as completed
            payment.transaction_id = transaction_id
            payment.payment_gateway_response = gateway_response
            payment.mark_as_completed(transaction_id=transaction_id)
            
            return {
                'success': True,
                'transaction_id': transaction_id,
                'message': 'Paiement Stripe traité avec succès',
                'payment_method': 'stripe',
                'gateway_response': gateway_response
            }
        
        except stripe.error.CardError as e:
            # Card was declined
            payment.mark_as_failed(str(e))
            raise Exception(f"Carte refusée: {e.user_message}")
        
        except stripe.error.StripeError as e:
            # Stripe error
            payment.mark_as_failed(str(e))
            raise Exception(f"Erreur Stripe: {str(e)}")
        
        except Exception as e:
            payment.mark_as_failed(str(e))
            raise Exception(f"Erreur de paiement: {str(e)}")
    
    def process_refund(self, payment, amount, reason=''):
        """
        Process a Stripe refund.
        
        Args:
            payment: Payment instance
            amount: Amount to refund
            reason: Refund reason
        
        Returns:
            dict: Refund result
        """
        if not payment.is_refundable:
            raise ValueError("Ce paiement ne peut pas être remboursé.")
        
        if not payment.transaction_id:
            raise ValueError("ID de transaction manquant pour le remboursement.")
        
        try:
            # Convert amount to cents
            amount_cents = int(amount * 100)
            
            # Create refund
            refund = stripe.Refund.create(
                charge=payment.transaction_id,
                amount=amount_cents,
                reason='requested_by_customer',
                metadata={'reason': reason}
            )
            
            # Process refund in our system
            payment.process_refund(amount, reason)
            
            return {
                'success': True,
                'refund_id': refund.id,
                'refund_amount': amount,
                'message': 'Remboursement Stripe traité avec succès',
                'payment_method': 'stripe'
            }
        
        except stripe.error.StripeError as e:
            raise Exception(f"Erreur de remboursement Stripe: {str(e)}")
    
    def verify_payment(self, transaction_id):
        """
        Verify a Stripe payment.
        
        Args:
            transaction_id: Stripe transaction ID
        
        Returns:
            dict: Verification result
        """
        try:
            # Try to retrieve as PaymentIntent first
            try:
                intent = stripe.PaymentIntent.retrieve(transaction_id)
                return {
                    'verified': True,
                    'transaction_id': transaction_id,
                    'status': intent.status,
                    'amount': intent.amount / 100,
                    'currency': intent.currency.upper(),
                    'payment_method': 'stripe'
                }
            except:
                # Try as Charge
                charge = stripe.Charge.retrieve(transaction_id)
                return {
                    'verified': True,
                    'transaction_id': transaction_id,
                    'status': charge.status,
                    'amount': charge.amount / 100,
                    'currency': charge.currency.upper(),
                    'payment_method': 'stripe'
                }
        
        except stripe.error.StripeError as e:
            return {
                'verified': False,
                'transaction_id': transaction_id,
                'error': str(e),
                'payment_method': 'stripe'
            }