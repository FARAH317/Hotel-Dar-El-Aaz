"""
Payment model for handling reservation payments.
"""
from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

from apps.core.models.base import TimeStampedModel
from apps.reservations.models import Reservation
from apps.payments.managers.payment_manager import PaymentManager

User = get_user_model()


class Payment(TimeStampedModel):
    """
    Model representing a payment for a reservation.
    """
    
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Espèces'
        CREDIT_CARD = 'CREDIT_CARD', 'Carte de crédit'
        DEBIT_CARD = 'DEBIT_CARD', 'Carte de débit'
        STRIPE = 'STRIPE', 'Stripe'
        PAYPAL = 'PAYPAL', 'PayPal'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Virement bancaire'
        CCP = 'CCP', 'CCP (Algérie Poste)'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        PROCESSING = 'PROCESSING', 'En traitement'
        COMPLETED = 'COMPLETED', 'Complété'
        FAILED = 'FAILED', 'Échoué'
        REFUNDED = 'REFUNDED', 'Remboursé'
        CANCELLED = 'CANCELLED', 'Annulé'
    
    class PaymentType(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Acompte'
        FULL = 'FULL', 'Paiement complet'
        PARTIAL = 'PARTIAL', 'Paiement partiel'
        REFUND = 'REFUND', 'Remboursement'
    
    # Payment details
    payment_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="Numéro de paiement"
    )
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name="Réservation"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Utilisateur"
    )
    
    # Amount
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant (DZD)"
    )
    currency = models.CharField(
        max_length=3,
        default='DZD',
        verbose_name="Devise"
    )
    
    # Payment method and status
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        verbose_name="Méthode de paiement"
    )
    payment_type = models.CharField(
        max_length=10,
        choices=PaymentType.choices,
        default=PaymentType.FULL,
        verbose_name="Type de paiement"
    )
    status = models.CharField(
        max_length=15,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name="Statut"
    )
    
    # External payment details
    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        help_text="ID de transaction externe (Stripe, PayPal, etc.)",
        verbose_name="ID de transaction"
    )
    payment_gateway_response = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Réponse du gateway"
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payments',
        verbose_name="Traité par"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Traité le"
    )
    
    # Refund details
    refunded_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Montant remboursé (DZD)"
    )
    refund_reason = models.TextField(
        blank=True,
        verbose_name="Raison du remboursement"
    )
    refunded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Remboursé le"
    )
    
    # Custom Manager
    objects = PaymentManager()
    
    class Meta:
        db_table = 'payments'
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment_number']),
            models.Index(fields=['reservation', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.payment_number} - {self.amount} {self.currency} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        """Override save to generate payment number."""
        if not self.payment_number:
            self.payment_number = self.generate_payment_number()
        super().save(*args, **kwargs)
    
    def generate_payment_number(self):
        """Generate unique payment number."""
        from datetime import datetime
        import random
        
        timestamp = datetime.now().strftime('%Y%m%d')
        random_part = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        return f"PAY-{timestamp}-{random_part}"
    
    @property
    def is_successful(self):
        """Check if payment was successful."""
        return self.status == self.PaymentStatus.COMPLETED
    
    @property
    def is_refundable(self):
        """Check if payment can be refunded."""
        return (
            self.status == self.PaymentStatus.COMPLETED and
            self.refunded_amount < self.amount
        )
    
    @property
    def remaining_refund_amount(self):
        """Get remaining amount that can be refunded."""
        if not self.is_refundable:
            return Decimal('0.00')
        return self.amount - self.refunded_amount
    
    def mark_as_completed(self, transaction_id=None, processed_by=None):
        """Mark payment as completed."""
        from django.utils import timezone
        
        self.status = self.PaymentStatus.COMPLETED
        self.processed_at = timezone.now()
        
        if transaction_id:
            self.transaction_id = transaction_id
        if processed_by:
            self.processed_by = processed_by
        
        self.save(update_fields=[
            'status', 'transaction_id', 'processed_at', 'processed_by', 'updated_at'
        ])
    
    def mark_as_failed(self, reason=None):
        """Mark payment as failed."""
        self.status = self.PaymentStatus.FAILED
        if reason:
            self.notes = f"{self.notes}\nÉchec: {reason}".strip()
        self.save(update_fields=['status', 'notes', 'updated_at'])
    
    def process_refund(self, amount, reason='', processed_by=None):
        """Process a refund for this payment."""
        from django.utils import timezone
        
        if not self.is_refundable:
            raise ValueError("Ce paiement ne peut pas être remboursé.")
        
        if amount > self.remaining_refund_amount:
            raise ValueError("Le montant du remboursement dépasse le montant disponible.")
        
        self.refunded_amount += Decimal(str(amount))
        self.refund_reason = reason
        self.refunded_at = timezone.now()
        
        # If fully refunded, change status
        if self.refunded_amount >= self.amount:
            self.status = self.PaymentStatus.REFUNDED
        
        self.save(update_fields=[
            'refunded_amount', 'refund_reason', 'refunded_at', 'status', 'updated_at'
        ])
    
    def get_status_color(self):
        """Get color code for status display."""
        colors = {
            self.PaymentStatus.PENDING: 'warning',
            self.PaymentStatus.PROCESSING: 'info',
            self.PaymentStatus.COMPLETED: 'success',
            self.PaymentStatus.FAILED: 'danger',
            self.PaymentStatus.REFUNDED: 'secondary',
            self.PaymentStatus.CANCELLED: 'dark',
        }
        return colors.get(self.status, 'secondary')