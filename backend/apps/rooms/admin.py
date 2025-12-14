"""
Django admin configuration for Rooms app.
"""
from django.contrib import admin
from apps.rooms.models import Room, RoomType, Amenity


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    """Admin for RoomType model."""
    list_display = ['name', 'base_price', 'max_occupancy', 'size_sqm', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    """Admin for Amenity model."""
    list_display = ['name', 'category', 'icon', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name']
    ordering = ['category', 'name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """Admin for Room model."""
    list_display = ['room_number', 'room_type', 'floor', 'status', 'current_price', 'is_active']
    list_filter = ['status', 'floor', 'room_type', 'is_active']
    search_fields = ['room_number', 'description']
    filter_horizontal = ['amenities']
    ordering = ['floor', 'room_number']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('room_number', 'room_type', 'floor', 'status')
        }),
        ('Détails', {
            'fields': ('view_type', 'description', 'special_notes', 'main_image')
        }),
        ('Équipements', {
            'fields': ('amenities',)
        }),
        ('Prix', {
            'fields': ('custom_price',)
        }),
        ('Statut', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']