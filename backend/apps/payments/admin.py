"""
Django admin configuration for Payments app.
"""
from django.contrib import admin
from django.utils.html import format_html
from apps.payments.models import Payment, Invoice


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for Payment model."""
    list_display = [
        'payment_number', 'user', 'reservation', 'amount',
        'payment_method', 'status_badge', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'payment_type', 'created_at']
    search_fields = [
        'payment_number', 'transaction_id', 'user__email',
        'reservation__reservation_number'
    ]
    readonly_fields = [
        'payment_number', 'transaction_id', 'payment_gateway_response',
        'processed_at', 'refunded_at', 'created_at', 'updated_at'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('payment_number', 'user', 'reservation', 'status')
        }),
        ('Détails du paiement', {
            'fields': (
                'amount', 'currency', 'payment_method',
                'payment_type', 'transaction_id'
            )
        }),
        ('Traitement', {
            'fields': ('processed_by', 'processed_at', 'payment_gateway_response')
        }),
        ('Remboursement', {
            'fields': ('refunded_amount', 'refund_reason', 'refunded_at'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        """Display status with color badge."""
        color = obj.get_status_color()
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


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin for Invoice model."""
    list_display = [
        'invoice_number', 'user', 'billing_name',
        'total_amount', 'paid_amount', 'status', 'is_paid'
    ]
    list_filter = ['status', 'issue_date', 'due_date', 'created_at']
    search_fields = [
        'invoice_number', 'billing_name', 'billing_email',
        'user__email', 'reservation__reservation_number'
    ]
    readonly_fields = [
        'invoice_number', 'subtotal', 'tax_amount', 'discount_amount',
        'total_amount', 'paid_amount', 'status', 'issue_date',
        'due_date', 'paid_date', 'created_at', 'updated_at',
        'balance_due', 'is_paid', 'is_overdue'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'issue_date'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('invoice_number', 'reservation', 'user', 'status')
        }),
        ('Facturation', {
            'fields': (
                'billing_name', 'billing_email',
                'billing_phone', 'billing_address'
            )
        }),
        ('Montants', {
            'fields': (
                'subtotal', 'tax_amount', 'discount_amount',
                'total_amount', 'paid_amount', 'balance_due'
            )
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date', 'is_paid', 'is_overdue')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )