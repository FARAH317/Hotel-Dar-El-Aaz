"""
API Views for Reservations management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.exceptions import ValidationError as DjangoValidationError

from apps.reservations.models import Reservation
from apps.reservations.services.reservation_service import ReservationService
from .serializers import (
    ReservationListSerializer,
    ReservationDetailSerializer,
    ReservationCreateSerializer,
    ReservationUpdateSerializer,
    CancelReservationSerializer,
    ApplyDiscountSerializer,
    ReservationStatsSerializer
)


class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Reservation CRUD operations.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ReservationListSerializer
        elif self.action == 'create':
            return ReservationCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ReservationUpdateSerializer
        return ReservationDetailSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on user role.
        """
        user = self.request.user
        
        # Admin and staff can see all reservations
        if user.is_staff or user.is_admin:
            return Reservation.objects.select_related(
                'user', 'room', 'room__room_type'
            ).all()
        
        # Regular users can only see their own reservations
        return Reservation.objects.filter(user=user).select_related(
            'room', 'room__room_type'
        )
    
    def create(self, request):
        """
        Create a new reservation.
        
        POST /api/reservations/
        """
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Create reservation using service layer
            reservation = ReservationService.create_reservation(
                user=request.user,
                **serializer.validated_data
            )
            
            return Response({
                'message': 'Réservation créée avec succès',
                'reservation': ReservationDetailSerializer(reservation).data
            }, status=status.HTTP_201_CREATED)
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """
        Update reservation details.
        
        PUT/PATCH /api/reservations/{id}/
        """
        reservation = self.get_object()
        serializer = ReservationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_reservation = ReservationService.update_reservation(
                reservation.id,
                **serializer.validated_data
            )
            
            return Response({
                'message': 'Réservation mise à jour avec succès',
                'reservation': ReservationDetailSerializer(updated_reservation).data
            })
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='my-reservations')
    def my_reservations(self, request):
        """
        Get current user's reservations.
        
        GET /api/reservations/my-reservations/
        """
        reservations = Reservation.objects.get_by_user(request.user)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            reservations = reservations.filter(status=status_filter)
        
        page = self.paginate_queryset(reservations)
        if page is not None:
            serializer = ReservationListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        """
        Confirm a pending reservation.
        
        POST /api/reservations/{id}/confirm/
        """
        reservation = self.get_object()
        
        try:
            confirmed_reservation = ReservationService.confirm_reservation(reservation.id)
            
            return Response({
                'message': 'Réservation confirmée avec succès',
                'reservation': ReservationDetailSerializer(confirmed_reservation).data
            })
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='cancel')
   
    def cancel(self, request, pk=None):
       """
       Cancel a reservation.
    
       POST /api/reservations/{id}/cancel/
       """
       try:
          print(f"🔍 VIEW - Starting cancellation")
          print(f"🔍 VIEW - Request data: {request.data}")
          print(f"🔍 VIEW - Reservation ID: {pk}")
          print(f"🔍 VIEW - User: {request.user.email}")
        
          reservation = self.get_object()
          print(f"🔍 VIEW - Reservation found: {reservation.reservation_number}")
          print(f"🔍 VIEW - Current status: {reservation.status}")
        
          serializer = CancelReservationSerializer(data=request.data)
          serializer.is_valid(raise_exception=True)
        
          reason = serializer.validated_data.get('reason', '')
          print(f"🔍 VIEW - Cancellation reason: '{reason}'")
        
          cancelled_reservation = ReservationService.cancel_reservation(
              reservation.id,
              reason=reason
            )
        
          print(f"✅ VIEW - Cancellation successful")
          print(f"✅ VIEW - New status: {cancelled_reservation.status}")
        
          return Response({
              'message': 'Réservation annulée avec succès',
              'reservation': ReservationDetailSerializer(cancelled_reservation).data
         }, status=status.HTTP_200_OK)
        
       except DjangoValidationError as e:
           error_message = str(e)
           print(f"❌ VIEW - Validation error: {error_message}")
           return Response({
              'error': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
    
       except Reservation.DoesNotExist:
          error_message = "Réservation introuvable"
          print(f"❌ VIEW - {error_message}")
          return Response({
              'error': error_message
            }, status=status.HTTP_404_NOT_FOUND)
    
       except Exception as e:
          error_message = f"Erreur serveur: {str(e)}"
          print(f"❌ VIEW - Unexpected error: {type(e).__name__}: {str(e)}")
        
          # Afficher le traceback complet pour debug
          import traceback
          print(f"❌ VIEW - Traceback:")
          print(traceback.format_exc())
        
          return Response({
            'error': error_message
          }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='check-in', permission_classes=[IsAdminUser])
    def check_in(self, request, pk=None):
        """
        Perform check-in for a reservation.
        
        POST /api/reservations/{id}/check-in/
        """
        reservation = self.get_object()
        
        try:
            checked_in_reservation = ReservationService.check_in_reservation(reservation.id)
            
            return Response({
                'message': 'Check-in effectué avec succès',
                'reservation': ReservationDetailSerializer(checked_in_reservation).data
            })
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='check-out', permission_classes=[IsAdminUser])
    def check_out(self, request, pk=None):
        """
        Perform check-out for a reservation.
        
        POST /api/reservations/{id}/check-out/
        """
        reservation = self.get_object()
        
        try:
            checked_out_reservation = ReservationService.check_out_reservation(reservation.id)
            
            return Response({
                'message': 'Check-out effectué avec succès',
                'reservation': ReservationDetailSerializer(checked_out_reservation).data
            })
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='apply-discount', permission_classes=[IsAdminUser])
    def apply_discount(self, request, pk=None):
        """
        Apply discount to a reservation.
        
        POST /api/reservations/{id}/apply-discount/
        """
        reservation = self.get_object()
        serializer = ApplyDiscountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_reservation = ReservationService.apply_discount(
                reservation.id,
                serializer.validated_data['discount_amount'],
                serializer.validated_data.get('reason', '')
            )
            
            return Response({
                'message': 'Remise appliquée avec succès',
                'reservation': ReservationDetailSerializer(updated_reservation).data
            })
            
        except DjangoValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='upcoming', permission_classes=[IsAdminUser])
    def upcoming(self, request):
        """
        Get upcoming reservations.
        
        GET /api/reservations/upcoming/
        """
        days = int(request.query_params.get('days', 7))
        reservations = Reservation.objects.get_upcoming_reservations(days)
        
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='todays-checkins', permission_classes=[IsAdminUser])
    def todays_checkins(self, request):
        """
        Get today's check-ins.
        
        GET /api/reservations/todays-checkins/
        """
        reservations = Reservation.objects.get_todays_check_ins()
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='todays-checkouts', permission_classes=[IsAdminUser])
    def todays_checkouts(self, request):
        """
        Get today's check-outs.
        
        GET /api/reservations/todays-checkouts/
        """
        reservations = Reservation.objects.get_todays_check_outs()
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='statistics', permission_classes=[IsAdminUser])
    def statistics(self, request):
        """
        Get reservation statistics.
        
        GET /api/reservations/statistics/
        """
        from datetime import date, timedelta
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        stats = Reservation.objects.get_statistics(start_date, end_date)
        serializer = ReservationStatsSerializer(stats)
        
        return Response(serializer.data)