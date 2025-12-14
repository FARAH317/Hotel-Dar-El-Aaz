"""
Serializers for Notifications API.
"""
from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    """
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    channel_display = serializers.CharField(
        source='get_channel_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    is_read = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'channel', 'channel_display', 'status', 'status_display',
            'subject', 'message', 'html_message', 'recipient_email',
            'recipient_phone', 'reservation_id', 'payment_id',
            'sent_at', 'read_at', 'error_message', 'retry_count',
            'is_read', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'notification_type', 'channel', 'status', 'subject',
            'message', 'html_message', 'recipient_email', 'recipient_phone',
            'reservation_id', 'payment_id', 'sent_at', 'read_at',
            'error_message', 'retry_count', 'created_at', 'updated_at'
        ]


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for notification list.
    """
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    is_read = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'status', 'status_display', 'subject', 'is_read',
            'sent_at', 'created_at'
        ]