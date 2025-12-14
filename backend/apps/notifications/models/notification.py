"""
Notification model for tracking user notifications.
"""
from django.db import models
from django.contrib.auth import get_user_model

from apps.core.models.base import TimeStampedModel

User = get_user_model()


class Notification(TimeStampedModel):
    """
    Model representing a notification sent to a user.
    """
    
    class NotificationType(models.TextChoices):
        RESERVATION_CREATED = 'RESERVATION_CREATED', 'Réservation créée'
        RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED', 'Réservation confirmée'
        RESERVATION_CANCELLED = 'RESERVATION_CANCELLED', 'Réservation annulée'
        RESERVATION_REMINDER = 'RESERVATION_REMINDER', 'Rappel de réservation'
        CHECK_IN_REMINDER = 'CHECK_IN_REMINDER', 'Rappel de check-in'
        CHECK_OUT_REMINDER = 'CHECK_OUT_REMINDER', 'Rappel de check-out'
        PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', 'Paiement reçu'
        PAYMENT_FAILED = 'PAYMENT_FAILED', 'Paiement échoué'
        REFUND_PROCESSED = 'REFUND_PROCESSED', 'Remboursement effectué'
        INVOICE_GENERATED = 'INVOICE_GENERATED', 'Facture générée'
        GENERAL = 'GENERAL', 'Notification générale'
    
    class NotificationChannel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        IN_APP = 'IN_APP', 'In-App'
        PUSH = 'PUSH', 'Push Notification'
    
    class NotificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        SENT = 'SENT', 'Envoyé'
        DELIVERED = 'DELIVERED', 'Délivré'
        FAILED = 'FAILED', 'Échoué'
        READ = 'READ', 'Lu'
    
    # Notification details
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Utilisateur"
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        verbose_name="Type de notification"
    )
    channel = models.CharField(
        max_length=10,
        choices=NotificationChannel.choices,
        default=NotificationChannel.EMAIL,
        verbose_name="Canal"
    )
    status = models.CharField(
        max_length=15,
        choices=NotificationStatus.choices,
        default=NotificationStatus.PENDING,
        verbose_name="Statut"
    )
    
    # Content
    subject = models.CharField(
        max_length=200,
        verbose_name="Sujet"
    )
    message = models.TextField(
        verbose_name="Message"
    )
    html_message = models.TextField(
        blank=True,
        verbose_name="Message HTML"
    )
    
    # Recipient info
    recipient_email = models.EmailField(
        blank=True,
        verbose_name="Email destinataire"
    )
    recipient_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone destinataire"
    )
    
    # Related objects (optional)
    reservation_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name="ID Réservation"
    )
    payment_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name="ID Paiement"
    )
    
    # Metadata
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Envoyé le"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Lu le"
    )
    error_message = models.TextField(
        blank=True,
        verbose_name="Message d'erreur"
    )
    retry_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de tentatives"
    )
    
    class Meta:
        db_table = 'notifications'
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['notification_type', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.user.email} - {self.get_status_display()}"
    
    def mark_as_sent(self):
        """Mark notification as sent."""
        from django.utils import timezone
        
        self.status = self.NotificationStatus.SENT
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at', 'updated_at'])
    
    def mark_as_failed(self, error_message=''):
        """Mark notification as failed."""
        self.status = self.NotificationStatus.FAILED
        self.error_message = error_message
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count', 'updated_at'])
    
    def mark_as_read(self):
        """Mark notification as read (for in-app notifications)."""
        from django.utils import timezone
        
        if self.status in [self.NotificationStatus.SENT, self.NotificationStatus.DELIVERED]:
            self.status = self.NotificationStatus.READ
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at', 'updated_at'])
    
    @property
    def is_read(self):
        """Check if notification has been read."""
        return self.status == self.NotificationStatus.READ
    
    @property
    def can_retry(self):
        """Check if notification can be retried."""
        return self.status == self.NotificationStatus.FAILED and self.retry_count < 3