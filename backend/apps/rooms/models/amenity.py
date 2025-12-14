"""
Amenity model for room features and services.
"""
from django.db import models
from apps.core.models.base import TimeStampedModel


class Amenity(TimeStampedModel):
    """
    Model representing room amenities (WiFi, TV, AC, etc.)
    """
    
    class AmenityCategory(models.TextChoices):
        COMFORT = 'COMFORT', 'Confort'
        TECHNOLOGY = 'TECHNOLOGY', 'Technologie'
        BATHROOM = 'BATHROOM', 'Salle de bain'
        ENTERTAINMENT = 'ENTERTAINMENT', 'Divertissement'
        FOOD = 'FOOD', 'Restauration'
        SAFETY = 'SAFETY', 'Sécurité'
        OTHER = 'OTHER', 'Autre'
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom de l'équipement"
    )
    category = models.CharField(
        max_length=20,
        choices=AmenityCategory.choices,
        default=AmenityCategory.OTHER,
        verbose_name="Catégorie"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Nom de l'icône (ex: wifi, tv, ac)",
        verbose_name="Icône"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    
    class Meta:
        db_table = 'amenities'
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"