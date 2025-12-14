"""
Reservation model - Core entity of the booking system.
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date

from apps.core.models.base import TimeStampedModel
from apps.rooms.models import Room
from apps.reservations.managers.reservation_manager import ReservationManager

User = get_user_model()


class Reservation(TimeStampedModel):
    """
    Model representing a room reservation.
    Implements State Pattern for reservation lifecycle.
    """
    
    class ReservationStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        CONFIRMED = 'CONFIRMED', 'Confirmée'
        CHECKED_IN = 'CHECKED_IN', 'Check-in effectué'
        CHECKED_OUT = 'CHECKED_OUT', 'Check-out effectué'
        CANCELLED = 'CANCELLED', 'Annulée'
        NO_SHOW = 'NO_SHOW', 'Client absent'
    
    # Reservation details
    reservation_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="Numéro de réservation"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name="Client"
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name='reservations',
        verbose_name="Chambre"
    )
    
    # Dates
    check_in_date = models.DateField(
        verbose_name="Date d'arrivée"
    )
    check_out_date = models.DateField(
        verbose_name="Date de départ"
    )
    actual_check_in = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Check-in réel"
    )
    actual_check_out = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Check-out réel"
    )
    
    # Guest information
    number_of_guests = models.PositiveIntegerField(
        default=1,
        verbose_name="Nombre d'invités"
    )
    guest_name = models.CharField(
        max_length=200,
        help_text="Nom du client principal si différent de l'utilisateur",
        blank=True,
        verbose_name="Nom de l'invité"
    )
    guest_email = models.EmailField(
        blank=True,
        verbose_name="Email de l'invité"
    )
    guest_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone de l'invité"
    )
    
    # Pricing
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix par nuit (DZD)"
    )
    total_nights = models.PositiveIntegerField(
        verbose_name="Nombre de nuits"
    )
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
    
    # Status and notes
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING,
        verbose_name="Statut"
    )
    special_requests = models.TextField(
        blank=True,
        verbose_name="Demandes spéciales"
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name="Notes internes"
    )
    cancellation_reason = models.TextField(
        blank=True,
        verbose_name="Raison de l'annulation"
    )
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'annulation"
    )
    
    # Custom Manager
    objects = ReservationManager()
    
    class Meta:
        db_table = 'reservations'
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reservation_number']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['room', 'check_in_date', 'check_out_date']),
            models.Index(fields=['status', 'check_in_date']),
        ]
    
    def __str__(self):
        return f"{self.reservation_number} - {self.user.get_full_name()} - {self.room.room_number}"
    
    def save(self, *args, **kwargs):
        """Override save to generate reservation number and calculate totals."""
        if not self.reservation_number:
            self.reservation_number = self.generate_reservation_number()
        
        # Calculate totals before saving
        self.calculate_totals()
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate reservation data."""
        super().clean()
        
        # Validate dates
        if self.check_out_date <= self.check_in_date:
            raise ValidationError({
                'check_out_date': 'La date de départ doit être après la date d\'arrivée.'
            })
        
        # Validate check-in date is not in the past
        if self.check_in_date < date.today() and not self.pk:
            raise ValidationError({
                'check_in_date': 'La date d\'arrivée ne peut pas être dans le passé.'
            })
        
        # Validate number of guests
        if hasattr(self, 'room') and self.number_of_guests > self.room.room_type.max_occupancy:
            raise ValidationError({
                'number_of_guests': f'Le nombre d\'invités ne peut pas dépasser {self.room.room_type.max_occupancy}.'
            })
    
    def generate_reservation_number(self):
        """Generate unique reservation number."""
        from datetime import datetime
        import random
        
        timestamp = datetime.now().strftime('%Y%m%d')
        random_part = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        return f"RES-{timestamp}-{random_part}"
    
    def calculate_totals(self):
        """Calculate reservation totals."""
        if not self.price_per_night or not self.check_in_date or not self.check_out_date:
            return
        
        # Calculate nights
        delta = self.check_out_date - self.check_in_date
        self.total_nights = delta.days
        
        # Calculate subtotal
        self.subtotal = self.price_per_night * self.total_nights
        
        # Calculate total (subtotal + tax - discount)
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
    
    @property
    def duration_days(self):
        """Get reservation duration in days."""
        return (self.check_out_date - self.check_in_date).days
    
    @property
    def is_active(self):
        """Check if reservation is active."""
        return self.status in [
            self.ReservationStatus.CONFIRMED,
            self.ReservationStatus.CHECKED_IN
        ]
    
    @property
    def can_cancel(self):
        """Check if reservation can be cancelled."""
        return self.status in [
            self.ReservationStatus.PENDING,
            self.ReservationStatus.CONFIRMED
        ]
    
    @property
    def can_check_in(self):
        """Check if check-in is possible."""
        return (
            self.status == self.ReservationStatus.CONFIRMED and
            self.check_in_date <= date.today()
        )
    
    @property
    def can_check_out(self):
        """Check if check-out is possible."""
        return self.status == self.ReservationStatus.CHECKED_IN
    
    def get_status_display_color(self):
        """Get color code for status display."""
        colors = {
            self.ReservationStatus.PENDING: 'warning',
            self.ReservationStatus.CONFIRMED: 'info',
            self.ReservationStatus.CHECKED_IN: 'success',
            self.ReservationStatus.CHECKED_OUT: 'secondary',
            self.ReservationStatus.CANCELLED: 'danger',
            self.ReservationStatus.NO_SHOW: 'dark',
        }
        return colors.get(self.status, 'secondary')