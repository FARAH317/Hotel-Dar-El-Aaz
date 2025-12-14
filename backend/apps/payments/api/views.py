"""
API Views for Payments management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.exceptions import ValidationError as DjangoValidationError

from apps.payments.models import Payment, Invoice
from apps.payments.services.payment_service import PaymentService
from .serializers import (
    PaymentListSerializer,
    PaymentDetailSerializer,
    PaymentCreateSerializer,
    ProcessPaymentSerializer,
    RefundPaymentSerializer,
    InvoiceSerializer,
    PaymentStatsSerializer
)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment CRUD operations.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action == 'create':
            return PaymentCreateSerializer
        return PaymentDetailSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        # Admin and staff can see all payments
        if user.is_staff or user.is_admin:
            return Payment.objects.select_related(
                'user', 'reservation', 'processed_by'
            ).all()
        
        # Regular users can only see their own payments
        return Payment.objects.get_by_user(user)
    
    def create(self, request):
       """
       Create a new payment.
    
       POST /api/payments/
       """
       import traceback
    
       try:
          print(f"🔍 Received payment creation request")
          print(f"🔍 User: {request.user.id} ({request.user.email})")
          print(f"🔍 Data: {request.data}")
        
          serializer = PaymentCreateSerializer(data=request.data)
        
          if not serializer.is_valid():
              print(f"❌ Serializer validation failed: {serializer.errors}")
              return Response({
                  'error': 'Données invalides',
                  'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
          print(f"✅ Serializer validated: {serializer.validated_data}")
        
          # Create payment using service layer
          payment = PaymentService.create_payment(
             user=request.user,
             **serializer.validated_data
            )
        
          print(f"✅ Payment created: {payment.id}")
        
          return Response({
             'message': 'Paiement créé avec succès',
             'payment': PaymentDetailSerializer(payment).data
            }, status=status.HTTP_201_CREATED)
        
       except DjangoValidationError as e:
         print(f"❌ Django ValidationError: {str(e)}")
         return Response({
             'error': str(e)
         }, status=status.HTTP_400_BAD_REQUEST)
       except Exception as e:
          print(f"❌ Unexpected error in create view:")
          print(traceback.format_exc())
          return Response({
              'error': f'Erreur serveur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='process')
    def process(self, request, pk=None):
        """
        Process a payment.
        
        POST /api/payments/{id}/process/
        """
        payment = self.get_object()
        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Add processed_by for manual payments
            payment_data = serializer.validated_data.copy()
            if payment.payment_method in ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CCP']:
                payment_data['processed_by'] = request.user
            
            # Process payment using service layer
            result = PaymentService.process_payment(
                payment.id,
                **payment_data
            )
            
            # Refresh payment from database
            payment.refresh_from_db()
            
            return Response({
                'message': result.get('message', 'Paiement traité avec succès'),
                'payment': PaymentDetailSerializer(payment).data,
                'result': result
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='refund', permission_classes=[IsAdminUser])
    def refund(self, request, pk=None):
        """
        Process a refund for a payment.
        
        POST /api/payments/{id}/refund/
        """
        payment = self.get_object()
        serializer = RefundPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = PaymentService.process_refund(
                payment.id,
                amount=serializer.validated_data['amount'],
                reason=serializer.validated_data.get('reason', ''),
                processed_by=request.user
            )
            
            # Refresh payment from database
            payment.refresh_from_db()
            
            return Response({
                'message': result.get('message', 'Remboursement traité avec succès'),
                'payment': PaymentDetailSerializer(payment).data,
                'result': result
            })
            
        except (DjangoValidationError, ValueError) as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='my-payments')
    def my_payments(self, request):
        """
        Get current user's payments.
        
        GET /api/payments/my-payments/
        """
        payments = Payment.objects.get_by_user(request.user)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            payments = payments.filter(status=status_filter)
        
        page = self.paginate_queryset(payments)
        if page is not None:
            serializer = PaymentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-reservation/(?P<reservation_id>[^/.]+)')
    def by_reservation(self, request, reservation_id=None):
        """
        Get payments for a specific reservation with summary and reservation info.
        
        GET /api/payments/by-reservation/{reservation_id}/
        """
        from apps.reservations.models import Reservation
        
        try:
            reservation = Reservation.objects.select_related(
                'user', 'room', 'room__room_type'
            ).get(id=reservation_id)
            
            # Check permission
            if not (request.user.is_staff or request.user == reservation.user):
                return Response(
                    {'error': 'Permission refusée'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get payments for this reservation
            payments = Payment.objects.get_by_reservation(reservation)
            
            # Get payment summary
            summary = PaymentService.get_reservation_payment_summary(reservation_id)
            
            # Import du serializer ici pour éviter les imports circulaires
            try:
                from apps.reservations.api.serializers import ReservationSerializer
                reservation_data = ReservationSerializer(reservation).data
            except ImportError:
                # Fallback si le serializer n'existe pas
                reservation_data = {
                    'id': str(reservation.id),
                    'reservation_number': reservation.reservation_number,
                    'total_amount': float(reservation.total_amount),
                    'status': reservation.status,
                    'check_in_date': reservation.check_in_date,
                    'check_out_date': reservation.check_out_date,
                }
            
            return Response({
                'reservation': reservation_data,
                'payments': PaymentListSerializer(payments, many=True).data,
                'summary': summary
            })
            
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Réservation introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Log l'erreur pour debugging
            import traceback
            print(f"Error in by_reservation: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Erreur serveur: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='statistics', permission_classes=[IsAdminUser])
    def statistics(self, request):
        """
        Get payment statistics.
        
        GET /api/payments/statistics/
        """
        from datetime import date, timedelta
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        stats = Payment.objects.get_statistics(start_date, end_date)
        serializer = PaymentStatsSerializer(stats)
        
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Invoice operations (Read-only for users).
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        # Admin and staff can see all invoices
        if user.is_staff or user.is_admin:
            return Invoice.objects.select_related('user', 'reservation').all()
        
        # Regular users can only see their own invoices
        return Invoice.objects.filter(user=user).select_related('reservation')
    
    @action(detail=False, methods=['post'], url_path='create-for-reservation')
    def create_for_reservation(self, request):
        """
        Create an invoice for a reservation.
        
        POST /api/invoices/create-for-reservation/
        Body: {"reservation_id": "uuid"}
        """
        reservation_id = request.data.get('reservation_id')
        
        if not reservation_id:
            return Response(
                {'error': 'reservation_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invoice = PaymentService.create_invoice(reservation_id)
            
            return Response({
                'message': 'Facture créée avec succès',
                'invoice': InvoiceSerializer(invoice).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='by-reservation/(?P<reservation_id>[^/.]+)')
    def by_reservation(self, request, reservation_id=None):
       """
       Get payments for a specific reservation with summary and reservation info.
    
       GET /api/payments/by-reservation/{reservation_id}/
       """
       from apps.reservations.models import Reservation
       from decimal import Decimal
    
       try:
           reservation = Reservation.objects.select_related(
            'user', 'room', 'room__room_type'
           ).get(id=reservation_id)
        
           # Check permission
           if not (request.user.is_staff or request.user == reservation.user):
              return Response(
                 {'error': 'Permission refusée'},
                 status=status.HTTP_403_FORBIDDEN
                )
        
           # Get payments for this reservation
           payments = Payment.objects.get_by_reservation(reservation)
        
           # Get payment summary
           summary = PaymentService.get_reservation_payment_summary(reservation_id)
        
           # Construire les données de réservation manuellement
           reservation_data = {
              'id': str(reservation.id),
              'reservation_number': reservation.reservation_number,
              'status': reservation.status,
              'check_in_date': str(reservation.check_in_date),
              'check_out_date': str(reservation.check_out_date),
              'total_amount': str(reservation.total_amount),
              'subtotal': str(reservation.subtotal),
              'tax_amount': str(reservation.tax_amount),
              'discount_amount': str(reservation.discount_amount),
              'number_of_guests': reservation.number_of_guests,
              'duration_days': reservation.duration_days,
              'is_active': reservation.is_active,
              'can_cancel': reservation.can_cancel,
              'guest_name': reservation.guest_name,
              'guest_email': reservation.guest_email,
              'guest_phone': reservation.guest_phone,
              'special_requests': reservation.special_requests,
              'created_at': reservation.created_at.isoformat() if reservation.created_at else None,
              'room': {
                  'id': str(reservation.room.id),
                  'room_number': reservation.room.room_number,
                  'room_type': {
                      'name': reservation.room.room_type.name if reservation.room.room_type else None
                    } if hasattr(reservation.room, 'room_type') else None
                } if reservation.room else None,
            }
        
           return Response({
              'reservation': reservation_data,
              'payments': PaymentListSerializer(payments, many=True).data,
              'summary': summary
            })
        
       except Reservation.DoesNotExist:
          return Response(
              {'error': 'Réservation introuvable'},
              status=status.HTTP_404_NOT_FOUND
            )
       except Exception as e:
          # Log l'erreur complète
          import traceback
          error_trace = traceback.format_exc()
          print(f"❌ Error in by_reservation: {str(e)}")
          print(error_trace)
        
          return Response(
              {'error': f'Erreur serveur: {str(e)}'},
              status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )