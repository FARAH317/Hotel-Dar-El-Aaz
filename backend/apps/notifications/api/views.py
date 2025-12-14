"""
API Views for Notifications management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.notifications.models import Notification
from apps.notifications.services.notification_service import NotificationService
from .serializers import NotificationSerializer, NotificationListSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Notification operations (Read-only).
    Users can view and mark as read, but cannot create/delete.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        """
        Get notifications for current user.
        """
        return NotificationService.get_user_notifications(self.request.user)
    
    @action(detail=False, methods=['get'], url_path='unread')
    def unread(self, request):
        """
        Get unread notifications for current user.
        
        GET /api/notifications/unread/
        """
        notifications = NotificationService.get_user_notifications(
            request.user,
            unread_only=True
        )
        
        serializer = NotificationListSerializer(notifications, many=True)
        
        return Response({
            'count': notifications.count(),
            'notifications': serializer.data
        })
    
    @action(detail=True, methods=['post'], url_path='mark-as-read')
    def mark_as_read(self, request, pk=None):
        """
        Mark a notification as read.
        
        POST /api/notifications/{id}/mark-as-read/
        """
        notification = self.get_object()
        
        if notification.user != request.user:
            return Response(
                {'error': 'Permission refusée'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marquée comme lue',
            'notification': NotificationSerializer(notification).data
        })
    
    @action(detail=False, methods=['post'], url_path='mark-all-as-read')
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read for current user.
        
        POST /api/notifications/mark-all-as-read/
        """
        count = NotificationService.mark_all_as_read(request.user)
        
        return Response({
            'message': f'{count} notification(s) marquée(s) comme lue(s)',
            'count': count
        })
    
    @action(detail=False, methods=['get'], url_path='count')
    def count(self, request):
        """
        Get notification counts for current user.
        
        GET /api/notifications/count/
        """
        all_notifications = NotificationService.get_user_notifications(request.user)
        unread_notifications = NotificationService.get_user_notifications(
            request.user,
            unread_only=True
        )
        
        return Response({
            'total': all_notifications.count(),
            'unread': unread_notifications.count(),
            'read': all_notifications.filter(status='READ').count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<notification_type>[^/.]+)')
    def by_type(self, request, notification_type=None):
        """
        Get notifications by type for current user.
        
        GET /api/notifications/by-type/{notification_type}/
        """
        notifications = NotificationService.get_user_notifications(
            request.user
        ).filter(notification_type=notification_type)
        
        page = self.paginate_queryset(notifications)
        if page is not None:
            serializer = NotificationListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = NotificationListSerializer(notifications, many=True)
        return Response(serializer.data)