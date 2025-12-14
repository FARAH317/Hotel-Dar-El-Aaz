"""
Django admin configuration for Reservations app.
"""
from django.contrib import admin
from django.utils.html import format_html
from apps.reservations.models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    """Admin for Reservation model."""
    list_display = [
        'reservation_number', 'user', 'room', 'check_in_date',
        'check_out_date', 'status_badge', 'total_amount', 'created_at'
    ]
    list_filter = ['status', 'check_in_date', 'check_out_date', 'created_at']
    search_fields = [
        'reservation_number', 'user__email', 'user__first_name',
        'user__last_name', 'room__room_number', 'guest_name'
    ]
    readonly_fields = [
        'reservation_number', 'price_per_night', 'total_nights',
        'subtotal', 'tax_amount', 'total_amount', 'created_at',
        'updated_at', 'actual_check_in', 'actual_check_out', 'cancelled_at'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'check_in_date'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('reservation_number', 'user', 'room', 'status')
        }),
        ('Dates', {
            'fields': (
                'check_in_date', 'check_out_date',
                'actual_check_in', 'actual_check_out'
            )
        }),
        ('Informations client', {
            'fields': (
                'number_of_guests', 'guest_name',
                'guest_email', 'guest_phone'
            )
        }),
        ('Tarification', {
            'fields': (
                'price_per_night', 'total_nights', 'subtotal',
                'tax_amount', 'discount_amount', 'total_amount'
            )
        }),
        ('Notes', {
            'fields': ('special_requests', 'internal_notes')
        }),
        ('Annulation', {
            'fields': ('cancellation_reason', 'cancelled_at'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        """Display status with color badge."""
        color = obj.get_status_display_color()
        colors_map = {
            'warning': '#ffc107',
            'info': '#17a2b8',
            'success': '#28a745',
            'secondary': '#6c757d',
            'danger': '#dc3545',
            'dark': '#343a40',
        }
        bg_color = colors_map.get(color, '#6c757d')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            bg_color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of checked-in/out reservations."""
        if obj and obj.status in ['CHECKED_IN', 'CHECKED_OUT']:
            return False
        return super().has_delete_permission(request, obj)