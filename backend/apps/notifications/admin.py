"""
Django admin configuration for Notifications app.
"""
from django.contrib import admin
from django.utils.html import format_html
from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for Notification model."""
    list_display = [
        'user', 'notification_type', 'channel',
        'status_badge', 'subject', 'sent_at', 'created_at'
    ]
    list_filter = [
        'notification_type', 'channel', 'status',
        'sent_at', 'created_at'
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'subject', 'message', 'recipient_email'
    ]
    readonly_fields = [
        'sent_at', 'read_at', 'created_at', 'updated_at'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'recipient_email', 'recipient_phone')
        }),
        ('Notification', {
            'fields': (
                'notification_type', 'channel', 'status',
                'subject', 'message', 'html_message'
            )
        }),
        ('Références', {
            'fields': ('reservation_id', 'payment_id'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'sent_at', 'read_at', 'error_message',
                'retry_count', 'created_at', 'updated_at'
            )
        }),
    )
    
    def status_badge(self, obj):
        """Display status with color badge."""
        colors = {
            'PENDING': '#ffc107',
            'SENT': '#17a2b8',
            'DELIVERED': '#28a745',
            'FAILED': '#dc3545',
            'READ': '#6c757d',
        }
        bg_color = colors.get(obj.status, '#6c757d')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            bg_color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'
    
    actions = ['retry_failed_notifications']
    
    def retry_failed_notifications(self, request, queryset):
        """Retry sending failed notifications."""
        from apps.notifications.services.notification_service import NotificationService
        
        count = 0
        for notification in queryset.filter(status='FAILED'):
            if notification.can_retry:
                NotificationService.send_notification(notification)
                count += 1
        
        self.message_user(request, f"{count} notification(s) renvoyée(s)")
    
    retry_failed_notifications.short_description = "Renvoyer les notifications échouées"