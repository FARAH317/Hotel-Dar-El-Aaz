"""
Room model - Main entity for hotel rooms.
"""
from django.db import models
from apps.core.models.base import TimeStampedModel
from apps.rooms.models.room_type import RoomType
from apps.rooms.models.amenity import Amenity
from apps.rooms.managers.room_manager import RoomManager


class Room(TimeStampedModel):
    """
    Model representing a physical hotel room.
    """
    objects = RoomManager()
    class RoomStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Disponible'
        OCCUPIED = 'OCCUPIED', 'Occupée'
        MAINTENANCE = 'MAINTENANCE', 'En maintenance'
        CLEANING = 'CLEANING', 'En nettoyage'
        OUT_OF_SERVICE = 'OUT_OF_SERVICE', 'Hors service'
    
    class FloorChoices(models.IntegerChoices):
        GROUND = 0, 'Rez-de-chaussée'
        FIRST = 1, '1er étage'
        SECOND = 2, '2ème étage'
        THIRD = 3, '3ème étage'
        FOURTH = 4, '4ème étage'
        FIFTH = 5, '5ème étage'
    
    room_number = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="Numéro de chambre"
    )
    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.PROTECT,
        related_name='rooms',
        verbose_name="Type de chambre"
    )
    floor = models.IntegerField(
        choices=FloorChoices.choices,
        default=FloorChoices.GROUND,
        verbose_name="Étage"
    )
    status = models.CharField(
        max_length=20,
        choices=RoomStatus.choices,
        default=RoomStatus.AVAILABLE,
        verbose_name="Statut"
    )
    amenities = models.ManyToManyField(
        Amenity,
        related_name='rooms',
        blank=True,
        verbose_name="Équipements"
    )
    
    # Additional details
    view_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Ex: Vue mer, Vue jardin, Vue ville",
        verbose_name="Type de vue"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    special_notes = models.TextField(
        blank=True,
        verbose_name="Notes spéciales"
    )
    
    # Images
    main_image = models.ImageField(
        upload_to='rooms/',
        null=True,
        blank=True,
        verbose_name="Image principale"
    )
    
    # Pricing override (si différent du type)
    custom_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Laisser vide pour utiliser le prix du type",
        verbose_name="Prix personnalisé (DZD)"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    
    class Meta:
        db_table = 'rooms'
        verbose_name = "Chambre"
        verbose_name_plural = "Chambres"
        ordering = ['floor', 'room_number']
        indexes = [
            models.Index(fields=['room_number']),
            models.Index(fields=['status']),
            models.Index(fields=['room_type', 'status']),
        ]
    
    def __str__(self):
        return f"Chambre {self.room_number} - {self.room_type.name}"
    
    @property
    def current_price(self):
        """
        Return the current price (custom or base price from room type).
        """
        return self.custom_price if self.custom_price else self.room_type.base_price
    
    @property
    def is_available(self):
        """
        Check if room is available for booking.
        """
        return self.status == self.RoomStatus.AVAILABLE and self.is_active
    
    def set_status(self, new_status):
        """
        Update room status.
        """
        if new_status in self.RoomStatus.values:
            self.status = new_status
            self.save(update_fields=['status', 'updated_at'])
    
    def mark_as_occupied(self):
        """Mark room as occupied."""
        self.set_status(self.RoomStatus.OCCUPIED)
    
    def mark_as_available(self):
        """Mark room as available."""
        self.set_status(self.RoomStatus.AVAILABLE)
    
    def mark_for_cleaning(self):
        """Mark room for cleaning."""
        self.set_status(self.RoomStatus.CLEANING)
    
    def mark_for_maintenance(self):
        """Mark room for maintenance."""
        self.set_status(self.RoomStatus.MAINTENANCE)