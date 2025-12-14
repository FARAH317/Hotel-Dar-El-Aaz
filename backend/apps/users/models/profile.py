# backend/apps/users/models/profile.py

from django.db import models
from apps.users.models.user import User  # référence ton modèle User

class Profile(models.Model):
    """
    Profil utilisateur optionnel pour stocker des informations supplémentaires.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_secondary = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = "Profil utilisateur"
        verbose_name_plural = "Profils utilisateurs"

    def __str__(self):
        return f"Profile of {self.user.get_full_name()}"
