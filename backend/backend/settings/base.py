from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

# Build paths inside the project like: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-1llaf2)*r=f!#f_hu17g_-gqk$(c6ep&vixhq5ip4zr^*_2#@!",
)

# Application definition
INSTALLED_APPS = [
    "jazzmin",
    "import_export",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "users",
    "details",
    "documents",
    "settings",
    "grades",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "dal",
    "dal_select2",
]

AUTH_USER_MODEL = "users.User"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# X-Frame-Options
X_FRAME_OPTIONS = "SAMEORIGIN"

# Jazzmin settings
JAZZMIN_SETTINGS = {
    "site_title": "POSSE ADMIN",
    "site_header": "POSSE ADMIN",
    "site_brand": "POSSE",
    "site_logo": "POSSE_ADMIN_ICON.png",
    "login_logo": "POSSE_ADMIN_ICON.png",
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "POSSE ADMIN",
    "copyright": "PSM ONLINE SYSTEM FOR SOFTWARE ENGINEERING",
    "topmenu_links": [
        {"name": "Back to POSSE", "url": "http://localhost:5173/", "new_window": True},
        {"model": "auth.User"},
        {"app": "books"},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [],
    "icons": {
        "details.Announcement": "fas fa-bullhorn",
        "details.Period": "fas fa-calendar",
        "details.Submissions": "fas fa-file-import",
        "documents.Document": "fas fa-file",
        "documents.Logbook": "fas fa-book",
        "documents.StudentSubmission": "fas fa-file-circle-exclamation",
        "documents.Feedback": "fas fa-file-circle-check",
        "settings.documentCategories": "fas fa-swatchbook",
        "settings.documentTheme": "fas fa-palette",
        "settings.Outline": "fas fa-border-none",
        "settings.documentModes": "fas fa-toggle-on",
        "settings.submissionStatusTheme": "fas fa-palette",
        "settings.SystemTheme": "fas fa-palette",
        "users.User": "fas fa-user",
        "users.CourseCoordinator": "fas fa-chalkboard-user",
        "users.Student": "fas fa-graduation-cap",
        "users.SupervisorsRequest": "fas fa-user-group",
        "grades.Grade": "fas fa-clipboard-list",
        "grades.MarkingScheme": "fas fa-tasks",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
}

# Email settings
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "25"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "webmaster@localhost")
