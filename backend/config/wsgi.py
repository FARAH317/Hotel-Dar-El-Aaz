import os
from django.core.wsgi import get_wsgi_application

# Définit le module de settings utilisé
DJANGO_SETTINGS = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings.development')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', DJANGO_SETTINGS)

application = get_wsgi_application()

# Support for serving static/media files on Heroku/Render with Whitenoise
try:
    from whitenoise import WhiteNoise
    application = WhiteNoise(application, root='staticfiles')
except ImportError:
    pass
