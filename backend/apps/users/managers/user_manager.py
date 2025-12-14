"""
Custom User Manager implementing Repository Pattern.
"""
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)
    
    def get_by_email(self, email):
        """
        Get user by email.
        """
        try:
            return self.get(email=self.normalize_email(email))
        except self.model.DoesNotExist:
            return None
    
    def get_active_users(self):
        """
        Get all active users.
        """
        return self.filter(is_active=True)
    
    def get_clients(self):
        """
        Get all client users.
        """
        return self.filter(role='CLIENT', is_active=True)
    
    def get_staff(self):
        """
        Get all staff users.
        """
        return self.filter(role__in=['STAFF', 'ADMIN'], is_active=True)