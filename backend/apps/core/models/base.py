"""
Base model providing common fields for all models.
"""
from django.db import models
import uuid


class TimeStampedModel(models.Model):
    """
    Abstract base model providing timestamp fields.
    Tous les modèles hériteront de cette classe.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.__class__.__name__} - {self.id}"