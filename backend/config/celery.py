"""
Celery configuration for Hotel Reservation System.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

app = Celery('hotel_reservation')

# Load config from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()


# Periodic tasks configuration
app.conf.beat_schedule = {
    # Send check-in reminders daily at 6 PM
    'send-check-in-reminders': {
        'task': 'apps.notifications.tasks.send_check_in_reminders',
        'schedule': crontab(hour=18, minute=0),
    },
    # Send check-out reminders daily at 8 AM
    'send-check-out-reminders': {
        'task': 'apps.notifications.tasks.send_check_out_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    # Retry failed notifications every hour
    'retry-failed-notifications': {
        'task': 'apps.notifications.tasks.retry_failed_notifications',
        'schedule': crontab(minute=0),  # Every hour
    },
    # Cleanup old notifications weekly (Sunday at 2 AM)
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(day_of_week=0, hour=2, minute=0),
    },
}


@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery."""
    print(f'Request: {self.request!r}')