"""
Room Type model for categorizing rooms.
"""
from django.db import models
from apps.core.models.base import TimeStampedModel


class RoomType(TimeStampedModel):
    """
    Model representing different types of rooms (Single, Double, Suite, etc.)
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom du type"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix de base (DZD)"
    )
    max_occupancy = models.PositiveIntegerField(
        default=2,
        verbose_name="Capacité maximale"
    )
    size_sqm = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Superficie (m²)"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    
    class Meta:
        db_table = 'room_types'
        verbose_name = "Type de chambre"
        verbose_name_plural = "Types de chambres"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.base_price} DZD/nuit"