"""
Serializers for Rooms API.
"""
from rest_framework import serializers
from apps.rooms.models import Room, RoomType, Amenity


class AmenitySerializer(serializers.ModelSerializer):
    """
    Serializer for Amenity model.
    """
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Amenity
        fields = [
            'id', 'name', 'category', 'category_display',
            'icon', 'description', 'is_active'
        ]
        read_only_fields = ['id']


class RoomTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for RoomType model.
    """
    rooms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomType
        fields = [
            'id', 'name', 'description', 'base_price',
            'max_occupancy', 'size_sqm', 'is_active',
            'rooms_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_rooms_count(self, obj):
        """Get total number of rooms of this type."""
        return obj.rooms.filter(is_active=True).count()


class RoomListSerializer(serializers.ModelSerializer):
    """
    Serializer for Room list (lightweight).
    """
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    floor_display = serializers.CharField(source='get_floor_display', read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'room_type', 'room_type_name',
            'floor', 'floor_display', 'status', 'status_display',
            'current_price', 'view_type', 'main_image', 'is_available'
        ]


class RoomDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Room detail (full information).
    """
    room_type = RoomTypeSerializer(read_only=True)
    room_type_id = serializers.UUIDField(write_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    amenity_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    floor_display = serializers.CharField(source='get_floor_display', read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'room_type', 'room_type_id',
            'floor', 'floor_display', 'status', 'status_display',
            'amenities', 'amenity_ids', 'view_type', 'description',
            'special_notes', 'main_image', 'custom_price', 'current_price',
            'is_active', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create room with amenities."""
        amenity_ids = validated_data.pop('amenity_ids', [])
        room = Room.objects.create(**validated_data)
        
        if amenity_ids:
            room.amenities.set(amenity_ids)
        
        return room
    
    def update(self, instance, validated_data):
        """Update room with amenities."""
        amenity_ids = validated_data.pop('amenity_ids', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update amenities if provided
        if amenity_ids is not None:
            instance.amenities.set(amenity_ids)
        
        return instance


class RoomSearchSerializer(serializers.Serializer):
    """
    Serializer for room search filters.
    """
    check_in = serializers.DateField(required=False)
    check_out = serializers.DateField(required=False)
    room_type_id = serializers.UUIDField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    amenities = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    floor = serializers.IntegerField(required=False)
    view_type = serializers.CharField(required=False)
    
    def validate(self, attrs):
        """Validate search parameters."""
        check_in = attrs.get('check_in')
        check_out = attrs.get('check_out')
        
        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError({
                    'check_out': 'La date de départ doit être après la date d\'arrivée.'
                })
        
        return attrs


class RoomAvailabilitySerializer(serializers.Serializer):
    """
    Serializer for checking room availability.
    """
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    
    def validate(self, attrs):
        """Validate dates."""
        if attrs['check_out'] <= attrs['check_in']:
            raise serializers.ValidationError({
                'check_out': 'La date de départ doit être après la date d\'arrivée.'
            })
        
        return attrs