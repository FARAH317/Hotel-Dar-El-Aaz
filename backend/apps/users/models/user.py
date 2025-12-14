"""
Custom User model for the hotel reservation system.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from apps.core.models.base import TimeStampedModel
from apps.users.managers.user_manager import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """
    Custom User model with email as the unique identifier.
    """
    
    class UserRole(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        STAFF = 'STAFF', 'Personnel'
        CLIENT = 'CLIENT', 'Client'
    
    email = models.EmailField(
        unique=True,
        verbose_name="Email"
    )
    first_name = models.CharField(
        max_length=150,
        verbose_name="Prénom"
    )
    last_name = models.CharField(
        max_length=150,
        verbose_name="Nom"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone"
    )
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.CLIENT,
        verbose_name="Rôle"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    is_staff = models.BooleanField(
        default=False,
        verbose_name="Staff"
    )
    email_verified = models.BooleanField(
        default=False,
        verbose_name="Email vérifié"
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name
    
    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.role == self.UserRole.ADMIN
    
    @property
    def is_client(self):
        """Check if user is client."""
        return self.role == self.UserRole.CLIENT