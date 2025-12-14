"""
Serializers for Payments API.
"""
from rest_framework import serializers
from apps.payments.models import Payment, Invoice
from apps.users.api.serializers import UserSerializer


class PaymentListSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment list (lightweight).
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    reservation_number = serializers.CharField(source='reservation.reservation_number', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.CharField(source='get_status_color', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'user_name', 'reservation', 'reservation_number',
            'amount', 'currency', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'status_color', 'transaction_id', 'created_at'
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment detail (full information).
    """
    user = UserSerializer(read_only=True)
    reservation_number = serializers.CharField(source='reservation.reservation_number', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.CharField(source='get_status_color', read_only=True)
    is_successful = serializers.BooleanField(read_only=True)
    is_refundable = serializers.BooleanField(read_only=True)
    remaining_refund_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    # Ajouter les infos complètes de la réservation
    reservation_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'user', 'reservation', 'reservation_number',
            'reservation_details',  # ✅ IMPORTANT: Inclus dans fields
            'amount', 'currency', 'payment_method', 'payment_method_display',
            'payment_type', 'payment_type_display', 'status', 'status_display',
            'status_color', 'transaction_id', 'payment_gateway_response',
            'notes', 'processed_by', 'processed_at', 'refunded_amount',
            'refund_reason', 'refunded_at', 'is_successful', 'is_refundable',
            'remaining_refund_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'payment_number', 'user', 'transaction_id',
            'payment_gateway_response', 'processed_by', 'processed_at',
            'refunded_amount', 'refund_reason', 'refunded_at',
            'created_at', 'updated_at'
        ]
    
    def get_reservation_details(self, obj):
        """Return basic reservation information."""
        try:
            from apps.reservations.api.serializers import ReservationSerializer
            return ReservationSerializer(obj.reservation).data
        except Exception as e:
            # En cas d'erreur (import circulaire, etc.), retourner des infos basiques
            print(f"⚠️ Warning in get_reservation_details: {str(e)}")
            return {
                'id': str(obj.reservation.id),
                'reservation_number': obj.reservation.reservation_number,
                'total_amount': float(obj.reservation.total_amount),
                'status': obj.reservation.status,
            }


class PaymentCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new payment.
    """
    reservation_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        min_value=0.01,
        required=True
    )
    payment_method = serializers.ChoiceField(
        choices=Payment.PaymentMethod.choices,
        required=True
    )
    payment_type = serializers.ChoiceField(
        choices=Payment.PaymentType.choices,
        default='FULL',
        required=False
    )
    notes = serializers.CharField(
        required=False, 
        allow_blank=True,
        allow_null=True,
        default=''
    )
    
    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0")
        return value


class ProcessPaymentSerializer(serializers.Serializer):
    """
    Serializer for processing a payment.
    Different payment methods require different data.
    """
    # For Stripe
    payment_method_id = serializers.CharField(required=False)
    token = serializers.CharField(required=False)
    
    # For PayPal
    paypal_order_id = serializers.CharField(required=False)
    authorization_id = serializers.CharField(required=False)
    payer_email = serializers.EmailField(required=False)
    
    # For manual payments (cash, bank transfer)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    # For card payments
    card_number = serializers.CharField(required=False, allow_blank=True)
    card_expiry = serializers.CharField(required=False, allow_blank=True)
    card_cvv = serializers.CharField(required=False, allow_blank=True)
    card_name = serializers.CharField(required=False, allow_blank=True)
    
    # For CCP
    ccp_number = serializers.CharField(required=False, allow_blank=True)
    ccp_key = serializers.CharField(required=False, allow_blank=True)
    transaction_ref = serializers.CharField(required=False, allow_blank=True)


class RefundPaymentSerializer(serializers.Serializer):
    """
    Serializer for processing a refund.
    """
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0.01,
        required=True
    )
    reason = serializers.CharField(required=False, allow_blank=True)


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Invoice.
    """
    reservation_number = serializers.CharField(source='reservation.reservation_number', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'reservation', 'reservation_number',
            'user', 'user_name', 'billing_name', 'billing_email',
            'billing_phone', 'billing_address', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'paid_amount', 'balance_due',
            'status', 'status_display', 'issue_date', 'due_date', 'paid_date',
            'is_paid', 'is_overdue', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'user', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'paid_amount', 'status',
            'issue_date', 'due_date', 'paid_date', 'created_at', 'updated_at'
        ]


class PaymentStatsSerializer(serializers.Serializer):
    """
    Serializer for payment statistics.
    """
    total_payments = serializers.IntegerField()
    successful = serializers.IntegerField()
    pending = serializers.IntegerField()
    failed = serializers.IntegerField()
    refunded = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_refunded = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_payment = serializers.FloatField()
    by_method = serializers.ListField()
    by_status = serializers.ListField()