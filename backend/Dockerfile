# backend/Dockerfile
FROM python:3.12-slim

# Prevent Python from writing pyc files to disc and buffering stdout/stderr?
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies (PostgreSQL)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the main code
COPY . .

# Expose the port
EXPOSE 8000

# Start command (Defaults to development server for now)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]