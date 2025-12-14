"""
API Views for Rooms management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Q

from apps.rooms.models import Room, RoomType, Amenity
from .serializers import (
    RoomListSerializer,
    RoomDetailSerializer,
    RoomTypeSerializer,
    AmenitySerializer,
    RoomSearchSerializer,
    RoomAvailabilitySerializer
)


class RoomTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RoomType CRUD operations.
    """
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    
    def get_permissions(self):
        """
        Allow anyone to view, only admin to create/update/delete.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """
        Filter active room types for non-admin users.
        """
        if self.request.user.is_staff:
            return RoomType.objects.all()
        return RoomType.objects.filter(is_active=True)


class AmenityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Amenity CRUD operations.
    """
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    
    def get_permissions(self):
        """
        Allow anyone to view, only admin to create/update/delete.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """
        Filter by category if provided.
        """
        queryset = Amenity.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset


class RoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Room CRUD operations.
    """
    queryset = Room.objects.all()
    
    def get_permissions(self):
        """
        Allow anyone to view and search, only admin to create/update/delete.
        """
        if self.action in ['list', 'retrieve', 'search', 'check_availability']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_serializer_class(self):
        """
        Use different serializers for list and detail.
        """
        if self.action == 'list':
            return RoomListSerializer
        return RoomDetailSerializer
    
    def get_queryset(self):
        """
        Filter rooms based on user role.
        """
        if self.request.user.is_staff:
            return Room.objects.select_related('room_type').prefetch_related('amenities')
        return Room.objects.get_available_rooms()
    
    @action(detail=False, methods=['post'], url_path='search')
    def search(self, request):
       """
       Search rooms with filters.
       """
       serializer = RoomSearchSerializer(data=request.data)
       serializer.is_valid(raise_exception=True)

       filters = serializer.validated_data
       print(f"🔍 Filtres reçus: {filters}")
       print(f"🔍 room_type_id: {filters.get('room_type_id')}")


       # 2️⃣ Appliquer les autres filtres SUR le queryset déjà filtré
       filtered_rooms = Room.objects.search_rooms(**filters)
       print(f"✅ Chambres trouvées: {filtered_rooms.count()}") 
       for room in filtered_rooms:
           print(f"  - Chambre {room.room_number} (Type: {room.room_type.name}, ID: {room.room_type_id})")

       # 3️⃣ Pagination
       page = self.paginate_queryset(filtered_rooms)
       if page is not None:
          serializer = RoomListSerializer(page, many=True)
          return self.get_paginated_response(serializer.data)

       serializer = RoomListSerializer(filtered_rooms, many=True)
       return Response(serializer.data)

    
    @action(detail=False, methods=['post'], url_path='check-availability')
    def check_availability(self, request):
        """
        Check room availability for specific dates.
        
        POST /api/rooms/check-availability/
        """
        serializer = RoomAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        
        available_rooms = Room.objects.get_available_for_dates(check_in, check_out)
        
        return Response({
            'check_in': check_in,
            'check_out': check_out,
            'available_count': available_rooms.count(),
            'rooms': RoomListSerializer(available_rooms, many=True).data
        })
    
    @action(detail=True, methods=['post'], url_path='change-status')
    def change_status(self, request, pk=None):
        """
        Change room status (Admin only).
        
        POST /api/rooms/{id}/change-status/
        """
        room = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Le statut est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in Room.RoomStatus.values:
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        room.set_status(new_status)
        
        return Response({
            'message': 'Statut mis à jour avec succès',
            'room': RoomDetailSerializer(room).data
        })
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """
        Get room statistics (Admin only).
        
        GET /api/rooms/statistics/
        """
        stats = Room.objects.get_statistics()
        return Response(stats)