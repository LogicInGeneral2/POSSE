import os

# Load environment-specific settings based on DJANGO_ENV
ENVIRONMENT = os.getenv("DJANGO_ENV", "development")

if ENVIRONMENT == "production":
    from .prod import *  # noqa: F403
else:
    from .dev import *  # noqa: F403
