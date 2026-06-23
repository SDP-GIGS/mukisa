FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install dependencies
# We also install gunicorn since it's used in the other projects' Dockerfiles
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run gunicorn using the Mukisa backend's WSGI application path
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
