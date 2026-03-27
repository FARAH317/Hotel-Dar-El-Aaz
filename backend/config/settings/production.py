import os
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['timgadhotel.onrender.com', 'localhost', '127.0.0.1']

# Security Settings for Production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://timgadhotel.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
