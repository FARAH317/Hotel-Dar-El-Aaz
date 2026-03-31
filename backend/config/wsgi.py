import os
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Définit le module de settings utilisé
DJANGO_SETTINGS = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings.development')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', DJANGO_SETTINGS)

application = get_wsgi_application()

# Support for serving static files on Heroku/Render with Whitenoise
try:
    from whitenoise import WhiteNoise
    # Get the absolute path to staticfiles directory
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATICFILES_DIR = os.path.join(BASE_DIR, 'staticfiles')
    # Serve static files with Whitenoise
    application = WhiteNoise(
        application,
        root=STATICFILES_DIR,
        mimetypes={'woff2': 'font/woff2'},
        autorefresh=False
    )
except ImportError:
    pass
