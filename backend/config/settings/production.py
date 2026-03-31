import os
from .base import *

DEBUG = False
ALLOWED_HOSTS = [
    'hoteldarelaaz.vercel.app',
    'hotel-dar-el-aaz.onrender.com',
    '.onrender.com',
    'localhost',
    '127.0.0.1',
]

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
    "https://hoteldarelaaz.vercel.app",
    "https://hotel-dar-el-aaz.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Database
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
