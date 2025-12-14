"""
Notification Service - Observer Pattern implementation.
Handles sending notifications via different channels.
"""
from django.template.loader import render_to_string
from django.conf import settings
from apps.notifications.models import Notification


class NotificationService:
    """
    Service for creating and sending notifications.
    Implements Observer Pattern to respond to system events.
    """

    # ========================= BASIC METHODS ==========================

    @staticmethod
    def create_notification(user, notification_type, subject, message,
                            channel='EMAIL', **kwargs):
        """
        Create a notification record.
        """
        notification = Notification(
            user=user,
            notification_type=notification_type,
            channel=channel,
            subject=subject,
            message=message,
            html_message=kwargs.get('html_message', ''),
            recipient_email=kwargs.get('recipient_email', user.email),
            recipient_phone=kwargs.get('recipient_phone', user.phone),
            reservation_id=kwargs.get('reservation_id'),
            payment_id=kwargs.get('payment_id'),
        )

        notification.save()
        return notification

    @staticmethod
    def send_notification(notification):
        """
        Send notification using appropriate channel.
        """
        try:
            if notification.channel == 'EMAIL':
                return NotificationService._send_email(notification)
            elif notification.channel == 'SMS':
                return NotificationService._send_sms(notification)
            elif notification.channel == 'IN_APP':
                notification.mark_as_sent()
                return True
            else:
                notification.mark_as_failed("Canal non supporté")
                return False

        except Exception as e:
            notification.mark_as_failed(str(e))
            return False

    @staticmethod
    def _send_email(notification):
        """Send email notification."""
        from django.core.mail import send_mail

        try:
            send_mail(
                subject=notification.subject,
                message=notification.message,
                from_email=settings.EMAIL_HOST_USER or 'noreply@hotel.com',
                recipient_list=[notification.recipient_email],
                html_message=notification.html_message or None,
                fail_silently=False,
            )

            notification.mark_as_sent()
            return True

        except Exception as e:
            notification.mark_as_failed(str(e))
            return False

    @staticmethod
    def _send_sms(notification):
        """Send SMS notification (placeholder)."""
        print(f"📱 SMS to {notification.recipient_phone}: {notification.message}")
        notification.mark_as_sent()
        return True

    # ===================== RESERVATION NOTIFICATIONS =====================

    @staticmethod
    def send_reservation_confirmation(reservation):
        subject = f"Confirmation de réservation - {reservation.reservation_number}"

        message = f"""
Bonjour {reservation.user.get_full_name()},

Votre réservation a été créée avec succès !

Numéro de réservation : {reservation.reservation_number}
Chambre : {reservation.room.room_number} - {reservation.room.room_type.name}
Arrivée : {reservation.check_in_date.strftime('%d/%m/%Y')}
Départ : {reservation.check_out_date.strftime('%d/%m/%Y')}
Nombre de nuits : {reservation.total_nights}
Montant total : {reservation.total_amount} DZD

Merci d'avoir choisi notre hôtel !

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=reservation.user,
            notification_type='RESERVATION_CREATED',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=reservation.id,
            recipient_email=reservation.guest_email or reservation.user.email
        )

        NotificationService.send_notification(notification)

    @staticmethod
    def send_reservation_confirmed(reservation):
        subject = f"Réservation confirmée - {reservation.reservation_number}"

        message = f"""
Bonjour {reservation.user.get_full_name()},

Votre réservation a été confirmée !

Numéro de réservation : {reservation.reservation_number}
Chambre : {reservation.room.room_number}
Arrivée : {reservation.check_in_date.strftime('%d/%m/%Y')}
Départ : {reservation.check_out_date.strftime('%d/%m/%Y')}

Nous avons hâte de vous accueillir !

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=reservation.user,
            notification_type='RESERVATION_CONFIRMED',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=reservation.id,
            recipient_email=reservation.guest_email or reservation.user.email
        )

        NotificationService.send_notification(notification)

    @staticmethod
    def send_reservation_cancelled(reservation):
        subject = f"Réservation annulée - {reservation.reservation_number}"

        message = f"""
Bonjour {reservation.user.get_full_name()},

Votre réservation a été annulée.

Numéro de réservation : {reservation.reservation_number}
Raison : {reservation.cancellation_reason or 'Non spécifiée'}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=reservation.user,
            notification_type='RESERVATION_CANCELLED',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=reservation.id,
            recipient_email=reservation.guest_email or reservation.user.email
        )

        NotificationService.send_notification(notification)

    @staticmethod
    def send_check_in_reminder(reservation):
        subject = f"Rappel : Votre arrivée demain - {reservation.reservation_number}"

        message = f"""
Bonjour {reservation.user.get_full_name()},

Nous vous rappelons que votre arrivée est prévue demain !

Numéro de réservation : {reservation.reservation_number}
Chambre : {reservation.room.room_number}
Date d'arrivée : {reservation.check_in_date.strftime('%d/%m/%Y')}
Heure de check-in : À partir de 14h00

N'oubliez pas d'apporter une pièce d'identité.

À très bientôt !

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=reservation.user,
            notification_type='CHECK_IN_REMINDER',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=reservation.id
        )

        NotificationService.send_notification(notification)

    # ======================== PAYMENT NOTIFICATIONS ========================

    @staticmethod
    def send_payment_confirmation(payment):
        subject = f"Paiement reçu - {payment.payment_number}"

        message = f"""
Bonjour {payment.user.get_full_name()},

Votre paiement a été reçu avec succès !

Numéro de paiement : {payment.payment_number}
Montant : {payment.amount} {payment.currency}
Méthode : {payment.get_payment_method_display()}
Réservation : {payment.reservation.reservation_number}

Merci pour votre paiement !

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=payment.user,
            notification_type='PAYMENT_RECEIVED',
            subject=subject,
            message=message,
            channel='EMAIL',
            payment_id=payment.id,
            reservation_id=payment.reservation.id
        )

        NotificationService.send_notification(notification)

    @staticmethod
    def send_payment_failed(payment, error_message=''):
        """Send payment failed notification."""
        subject = f"Échec du paiement - {payment.payment_number}"

        message = f"""
Bonjour {payment.user.get_full_name()},

Malheureusement, votre paiement n'a pas pu être traité.

Numéro de paiement : {payment.payment_number}
Montant : {payment.amount} {payment.currency}
Méthode : {payment.get_payment_method_display()}
Réservation : {payment.reservation.reservation_number}
Raison : {error_message or 'Erreur inconnue'}

Veuillez réessayer ou contacter notre service client pour obtenir de l'aide.

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=payment.user,
            notification_type='PAYMENT_FAILED',
            subject=subject,
            message=message,
            channel='EMAIL',
            payment_id=payment.id,
            reservation_id=payment.reservation.id
        )

        NotificationService.send_notification(notification)

    @staticmethod
    def send_refund_notification(payment):
        subject = f"Remboursement effectué - {payment.payment_number}"

        message = f"""
Bonjour {payment.user.get_full_name()},

Un remboursement a été effectué sur votre paiement.

Numéro de paiement : {payment.payment_number}
Montant remboursé : {payment.refunded_amount} {payment.currency}
Raison : {payment.refund_reason or 'Non spécifiée'}

Le remboursement sera visible sur votre compte sous 5-10 jours ouvrables.

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=payment.user,
            notification_type='REFUND_PROCESSED',
            subject=subject,
            message=message,
            channel='EMAIL',
            payment_id=payment.id
        )

        NotificationService.send_notification(notification)

    # ======================== INVOICE NOTIFICATIONS ========================

    @staticmethod
    def send_invoice_generated(invoice):
        """Send invoice generated notification."""
        subject = f"Facture générée - {invoice.invoice_number}"

        message = f"""
Bonjour {invoice.user.get_full_name()},

Votre facture a été générée avec succès !

Numéro de facture : {invoice.invoice_number}
Réservation : {invoice.reservation.reservation_number}
Montant total : {invoice.total_amount} DZD
Montant payé : {invoice.paid_amount} DZD
Reste à payer : {invoice.balance_due} DZD

Vous pouvez consulter votre facture dans votre espace client.

Cordialement,
L'équipe de l'hôtel
        """

        notification = NotificationService.create_notification(
            user=invoice.user,
            notification_type='INVOICE_GENERATED',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=invoice.reservation.id
        )

        NotificationService.send_notification(notification)

    # ============================ UTILITY =============================

    @staticmethod
    def get_user_notifications(user, unread_only=False):
        queryset = Notification.objects.filter(user=user)
        if unread_only:
            queryset = queryset.exclude(status='READ')
        return queryset

    @staticmethod
    def mark_all_as_read(user):
        from django.utils import timezone
        return Notification.objects.filter(
            user=user,
            status__in=['SENT', 'DELIVERED']
        ).update(
            status='READ',
            read_at=timezone.now()
        )
