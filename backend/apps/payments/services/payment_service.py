"""
Payment Service Layer - Business logic for payments.
Implements Unit of Work pattern for transactions.
"""
from django.db import transaction
from django.core.exceptions import ValidationError
from decimal import Decimal

from apps.payments.models import Payment, Invoice
from apps.payments.services.strategies import get_payment_strategy
from apps.reservations.models import Reservation
from apps.notifications.services.notification_service import NotificationService


class PaymentService:
    """
    Service class handling payment business logic.
    """
    
    @staticmethod
    @transaction.atomic
    def create_payment(user, reservation_id, amount, payment_method, 
                      payment_type='FULL', **kwargs):
        """
        Create a new payment.
        
        Args:
            user: User making the payment
            reservation_id: UUID of the reservation
            amount: Payment amount
            payment_method: Payment method (CASH, STRIPE, etc.)
            payment_type: Payment type (FULL, PARTIAL, DEPOSIT)
            **kwargs: Additional payment data
        
        Returns:
            Payment: Created payment
        
        Raises:
            ValidationError: If validation fails
        """
        # Get reservation
        try:
            reservation = Reservation.objects.select_related('room', 'user').get(
                id=reservation_id
            )
        except Reservation.DoesNotExist:
            raise ValidationError("Réservation introuvable.")
        
        # Validate reservation status
        if reservation.status not in ['PENDING', 'CONFIRMED']:
            raise ValidationError(
                "Les paiements ne peuvent être effectués que pour les réservations en attente ou confirmées."
            )
        
        # Validate amount
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValidationError("Le montant doit être positif.")
        
        # Check if payment doesn't exceed reservation total
        existing_payments = Payment.objects.get_by_reservation(reservation)
        total_paid = sum(
            p.amount for p in existing_payments if p.status == 'COMPLETED'
        )
        
        if total_paid + amount > reservation.total_amount:
            raise ValidationError(
                f"Le montant total des paiements ({total_paid + amount} DZD) "
                f"dépasse le montant de la réservation ({reservation.total_amount} DZD)."
            )
        
        # Create payment
        payment = Payment(
            user=user,
            reservation=reservation,
            amount=amount,
            payment_method=payment_method,
            payment_type=payment_type,
            status='PENDING',
            notes=kwargs.get('notes', '')
        )
        
        payment.save()
        
        return payment
    
    @staticmethod
    @transaction.atomic
    def process_payment(payment_id, **payment_data):
        """
        Process a payment using appropriate strategy.
        
        Args:
            payment_id: UUID of the payment
            **payment_data: Payment-specific data (token, payment_method_id, etc.)
        
        Returns:
            dict: Payment result
        
        Raises:
            Exception: If payment processing fails
        """
        payment = Payment.objects.select_related(
            'reservation', 'user'
        ).get(id=payment_id)
        
        if payment.status != 'PENDING':
            raise ValidationError("Ce paiement a déjà été traité.")
        
        # Get appropriate payment strategy
        strategy = get_payment_strategy(payment.payment_method)
        
        # Update status to processing
        payment.status = 'PROCESSING'
        payment.save(update_fields=['status', 'updated_at'])
        
        try:
            # Process payment using strategy
            result = strategy.process_payment(payment, **payment_data)
            
            # If successful
            if result['success']:
                # ✅ Envoyer notification de paiement réussi
                try:
                    NotificationService.send_payment_confirmation(payment)
                except Exception as e:
                    print(f"⚠️ Erreur lors de l'envoi de la notification de paiement: {e}")
                
                # Confirm reservation if pending
                if payment.reservation.status == 'PENDING':
                    from apps.reservations.services.reservation_service import ReservationService
                    ReservationService.confirm_reservation(payment.reservation.id)
            
            # Update or create invoice
            PaymentService._update_invoice(payment)
            
            return result
        
        except Exception as e:
            # Mark payment as failed
            payment.mark_as_failed(str(e))
            
            # ✅ Envoyer notification d'échec de paiement
            try:
                NotificationService.send_payment_failed(payment, str(e))
            except Exception as notif_error:
                print(f"⚠️ Erreur lors de l'envoi de la notification d'échec: {notif_error}")
            
            raise
    
    @staticmethod
    @transaction.atomic
    def process_refund(payment_id, amount, reason='', processed_by=None):
        """
        Process a refund for a payment.
        
        Args:
            payment_id: UUID of the payment
            amount: Amount to refund
            reason: Refund reason
            processed_by: User processing the refund
        
        Returns:
            dict: Refund result
        """
        payment = Payment.objects.select_related('reservation').get(id=payment_id)
        
        # Validate refund
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValidationError("Le montant du remboursement doit être positif.")
        
        if amount > payment.remaining_refund_amount:
            raise ValidationError(
                f"Le montant du remboursement ({amount} DZD) dépasse le montant disponible "
                f"({payment.remaining_refund_amount} DZD)."
            )
        
        # Get payment strategy
        strategy = get_payment_strategy(payment.payment_method)
        
        # Process refund using strategy
        result = strategy.process_refund(payment, amount, reason)
        
        # ✅ Envoyer notification de remboursement
        if result.get('success'):
            try:
                NotificationService.send_refund_notification(payment)
            except Exception as e:
                print(f"⚠️ Erreur lors de l'envoi de la notification de remboursement: {e}")
        
        # Update invoice
        PaymentService._update_invoice(payment)
        
        return result
    
    @staticmethod
    def get_payment_status(payment_id):
        """
        Get detailed payment status.
        
        Args:
            payment_id: UUID of the payment
        
        Returns:
            dict: Payment status information
        """
        payment = Payment.objects.select_related('reservation').get(id=payment_id)
        
        return {
            'payment_id': str(payment.id),
            'payment_number': payment.payment_number,
            'status': payment.status,
            'amount': payment.amount,
            'refunded_amount': payment.refunded_amount,
            'is_successful': payment.is_successful,
            'is_refundable': payment.is_refundable,
            'transaction_id': payment.transaction_id,
            'payment_method': payment.payment_method,
        }
    
    @staticmethod
    def get_reservation_payment_summary(reservation_id):
        """
        Get payment summary for a reservation.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            dict: Payment summary
        """
        reservation = Reservation.objects.get(id=reservation_id)
        return Payment.objects.get_reservation_payment_status(reservation)
    
    @staticmethod
    @transaction.atomic
    def create_invoice(reservation_id):
        """
        Create an invoice for a reservation.
        
        Args:
            reservation_id: UUID of the reservation
        
        Returns:
            Invoice: Created invoice
        """
        reservation = Reservation.objects.select_related('user').get(id=reservation_id)
        
        # Check if invoice already exists
        if hasattr(reservation, 'invoice'):
            return reservation.invoice
        
        # Create invoice
        invoice = Invoice(
            reservation=reservation,
            user=reservation.user,
            billing_name=reservation.guest_name or reservation.user.get_full_name(),
            billing_email=reservation.guest_email or reservation.user.email,
            billing_phone=reservation.guest_phone or reservation.user.phone,
            subtotal=reservation.subtotal,
            tax_amount=reservation.tax_amount,
            discount_amount=reservation.discount_amount,
            total_amount=reservation.total_amount,
        )
        
        invoice.save()
        invoice.mark_as_issued()
        
        # ✅ Envoyer notification de génération de facture
        try:
            NotificationService.send_invoice_generated(invoice)
        except Exception as e:
            print(f"⚠️ Erreur lors de l'envoi de la notification de facture: {e}")
        
        return invoice
    
    @staticmethod
    def _update_invoice(payment):
        """
        Update invoice with payment information.
        
        Args:
            payment: Payment instance
        """
        from django.db.models import Sum
        
        # Get or create invoice
        try:
            invoice = payment.reservation.invoice
        except Invoice.DoesNotExist:
            invoice = PaymentService.create_invoice(payment.reservation.id)
        
        # Update paid amount if payment is successful
        if payment.status == 'COMPLETED':
            # Calculate total paid for this reservation
            total_paid = Payment.objects.filter(
                reservation=payment.reservation,
                status='COMPLETED'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            invoice.paid_amount = total_paid
            
            # Update status
            if invoice.paid_amount >= invoice.total_amount:
                invoice.status = 'PAID'
                from datetime import date
                invoice.paid_date = date.today()
            elif invoice.paid_amount > 0:
                invoice.status = 'PARTIALLY_PAID'
            
            invoice.save()
    
    @staticmethod
    def verify_payment(payment_method, transaction_id):
        """
        Verify a payment using appropriate strategy.
        
        Args:
            payment_method: Payment method
            transaction_id: Transaction ID to verify
        
        Returns:
            dict: Verification result
        """
        strategy = get_payment_strategy(payment_method)
        return strategy.verify_payment(transaction_id)