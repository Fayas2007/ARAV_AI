# Production Dockerfile for ARAV AI Backend
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Prevent Python from writing .pyc and enable buffer-free logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port (default 8000 or dynamic PORT)
EXPOSE 8000

# Run uvicorn server
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
