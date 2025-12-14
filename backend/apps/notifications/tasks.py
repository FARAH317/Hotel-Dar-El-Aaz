"""
Celery tasks for asynchronous notification sending.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from apps.notifications.models import Notification
from apps.notifications.services.notification_service import NotificationService


@shared_task
def send_notification_task(notification_id):
    """
    Asynchronous task to send a notification.
    
    Args:
        notification_id: UUID of the notification
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        NotificationService.send_notification(notification)
        return f"Notification {notification_id} sent successfully"
    except Notification.DoesNotExist:
        return f"Notification {notification_id} not found"
    except Exception as e:
        return f"Error sending notification {notification_id}: {str(e)}"


@shared_task
def retry_failed_notifications():
    """
    Retry sending failed notifications.
    Runs periodically (e.g., every hour).
    """
    failed_notifications = Notification.objects.filter(
        status='FAILED',
        retry_count__lt=3
    )
    
    count = 0
    for notification in failed_notifications:
        if notification.can_retry:
            NotificationService.send_notification(notification)
            count += 1
    
    return f"Retried {count} failed notifications"


@shared_task
def send_check_in_reminders():
    """
    Send check-in reminders for tomorrow's reservations.
    Run daily at a specific time (e.g., 6 PM).
    """
    from apps.reservations.models import Reservation
    from datetime import date
    
    tomorrow = date.today() + timedelta(days=1)
    
    # Get confirmed reservations checking in tomorrow
    reservations = Reservation.objects.filter(
        status='CONFIRMED',
        check_in_date=tomorrow
    ).select_related('user', 'room')
    
    count = 0
    for reservation in reservations:
        NotificationService.send_check_in_reminder(reservation)
        count += 1
    
    return f"Sent {count} check-in reminders"


@shared_task
def send_check_out_reminders():
    """
    Send check-out reminders for today's check-outs.
    Run daily in the morning (e.g., 8 AM).
    """
    from apps.reservations.models import Reservation
    from datetime import date
    
    today = date.today()
    
    # Get checked-in reservations checking out today
    reservations = Reservation.objects.filter(
        status='CHECKED_IN',
        check_out_date=today
    ).select_related('user', 'room')
    
    count = 0
    for reservation in reservations:
        subject = f"Rappel : Check-out aujourd'hui - {reservation.reservation_number}"
        
        message = f"""
Bonjour {reservation.user.get_full_name()},

Nous espérons que vous avez passé un agréable séjour !

Rappel : Votre check-out est prévu aujourd'hui avant 12h00.

Numéro de réservation : {reservation.reservation_number}
Chambre : {reservation.room.room_number}

Merci d'avoir séjourné chez nous !

Cordialement,
L'équipe de l'hôtel
        """
        
        notification = NotificationService.create_notification(
            user=reservation.user,
            notification_type='CHECK_OUT_REMINDER',
            subject=subject,
            message=message,
            channel='EMAIL',
            reservation_id=reservation.id
        )
        
        NotificationService.send_notification(notification)
        count += 1
    
    return f"Sent {count} check-out reminders"


@shared_task
def cleanup_old_notifications():
    """
    Delete old read notifications (older than 90 days).
    Run weekly.
    """
    ninety_days_ago = timezone.now() - timedelta(days=90)
    
    deleted_count = Notification.objects.filter(
        status='READ',
        read_at__lt=ninety_days_ago
    ).delete()[0]
    
    return f"Deleted {deleted_count} old notifications"