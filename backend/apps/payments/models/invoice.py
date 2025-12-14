"""
Invoice model for generating invoices.
"""
from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

from apps.core.models.base import TimeStampedModel
from apps.reservations.models import Reservation

User = get_user_model()


class Invoice(TimeStampedModel):
    """
    Model representing an invoice for a reservation.
    """
    
    class InvoiceStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        ISSUED = 'ISSUED', 'Émise'
        PAID = 'PAID', 'Payée'
        PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partiellement payée'
        OVERDUE = 'OVERDUE', 'En retard'
        CANCELLED = 'CANCELLED', 'Annulée'
    
    # Invoice details
    invoice_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="Numéro de facture"
    )
    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.PROTECT,
        related_name='invoice',
        verbose_name="Réservation"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name="Client"
    )
    
    # Billing details
    billing_name = models.CharField(
        max_length=200,
        verbose_name="Nom de facturation"
    )
    billing_email = models.EmailField(
        verbose_name="Email de facturation"
    )
    billing_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone"
    )
    billing_address = models.TextField(
        blank=True,
        verbose_name="Adresse de facturation"
    )
    
    # Amounts
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Sous-total (DZD)"
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Montant des taxes (DZD)"
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Montant de la remise (DZD)"
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant total (DZD)"
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Montant payé (DZD)"
    )
    
    # Status and dates
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT,
        verbose_name="Statut"
    )
    issue_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date d'émission"
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date d'échéance"
    )
    paid_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de paiement"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    class Meta:
        db_table = 'invoices'
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'due_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.billing_name}"
    
    def save(self, *args, **kwargs):
        """Override save to generate invoice number."""
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)
    
    def generate_invoice_number(self):
        """Generate unique invoice number."""
        from datetime import datetime
        import random
        
        timestamp = datetime.now().strftime('%Y%m%d')
        random_part = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        return f"INV-{timestamp}-{random_part}"
    
    @property
    def balance_due(self):
        """Calculate remaining balance."""
        return self.total_amount - self.paid_amount
    
    @property
    def is_paid(self):
        """Check if invoice is fully paid."""
        return self.paid_amount >= self.total_amount
    
    @property
    def is_overdue(self):
        """Check if invoice is overdue."""
        from datetime import date
        return (
            self.due_date and
            self.due_date < date.today() and
            not self.is_paid
        )
    
    def mark_as_issued(self):
        """Mark invoice as issued."""
        from datetime import date, timedelta
        
        if not self.issue_date:
            self.issue_date = date.today()
        if not self.due_date:
            self.due_date = self.issue_date + timedelta(days=7)
        
        self.status = self.InvoiceStatus.ISSUED
        self.save(update_fields=['status', 'issue_date', 'due_date', 'updated_at'])
    
    def record_payment(self, amount):
        """Record a payment against this invoice."""
        from datetime import date
        
        self.paid_amount += Decimal(str(amount))
        
        # Update status based on payment
        if self.paid_amount >= self.total_amount:
            self.status = self.InvoiceStatus.PAID
            self.paid_date = date.today()
        elif self.paid_amount > 0:
            self.status = self.InvoiceStatus.PARTIALLY_PAID
        
        self.save(update_fields=['paid_amount', 'status', 'paid_date', 'updated_at'])