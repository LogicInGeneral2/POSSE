from .base import *
import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ["*"]  # Update with your Render/Vercel domain for security

# Database
DATABASES = {
    "default": dj_database_url.config(
        # Replace this value with your local database's connection string.
        default="postgresql://postgres:postgres@localhost:5432/mysite",
        conn_max_age=600,
    )
}

if not DEBUG:
    # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
    STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# WhiteNoise middleware for serving static files
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Added for static files
] + MIDDLEWARE
