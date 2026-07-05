# Use standard slim python image
FROM python:3.11-slim

# Install system dependencies needed for compiling psycopg2 and general tools
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Set Python Path and start uvicorn server
ENV PYTHONPATH=/workspace
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
