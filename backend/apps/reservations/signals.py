"""
Signals for Reservations - Observer Pattern.
These signals trigger notifications when reservation status changes.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.reservations.models import Reservation


@receiver(post_save, sender=Reservation)
def reservation_created(sender, instance, created, **kwargs):
    """
    Signal triggered when a reservation is created.
    Send confirmation email to user.
    """
    if created:
        print(f"✉️  Nouvelle réservation créée: {instance.reservation_number}")
        
        # Send notification asynchronously
        try:
            from apps.notifications.services.notification_service import NotificationService
            NotificationService.send_reservation_confirmation(instance)
        except Exception as e:
            print(f"Erreur lors de l'envoi de la notification: {e}")


@receiver(pre_save, sender=Reservation)
def reservation_status_changed(sender, instance, **kwargs):
    """
    Signal triggered when reservation status changes.
    Send appropriate notifications based on new status.
    """
    if instance.pk:  # Only for existing reservations
        try:
            old_instance = Reservation.objects.get(pk=instance.pk)
            
            # Check if status has changed
            if old_instance.status != instance.status:
                print(f"📊 Statut changé: {old_instance.status} → {instance.status}")
                
                from apps.notifications.services.notification_service import NotificationService
                
                # Handle different status changes
                if instance.status == 'CONFIRMED':
                    print(f"✅ Réservation confirmée: {instance.reservation_number}")
                    NotificationService.send_reservation_confirmed(instance)
                
                elif instance.status == 'CANCELLED':
                    print(f"❌ Réservation annulée: {instance.reservation_number}")
                    NotificationService.send_reservation_cancelled(instance)
                
                elif instance.status == 'CHECKED_IN':
                    print(f"🏨 Check-in effectué: {instance.reservation_number}")
                    # Optional: Send check-in confirmation
                
                elif instance.status == 'CHECKED_OUT':
                    print(f"👋 Check-out effectué: {instance.reservation_number}")
                    # Optional: Send thank you message
        
        except Reservation.DoesNotExist:
            pass
        except Exception as e:
            print(f"Erreur dans le signal: {e}")