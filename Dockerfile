# Dockerfile para Microservicios de Laika Club
FROM python:3.11-slim

# Evitar que Python genere archivos .pyc y permitir logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app

WORKDIR /app

# Instalar dependencias del sistema para MariaDB/MySQL, herramientas de compilación y Java (para Spark)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libmariadb-dev \
    mariadb-client \
    gcc \
    default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Por defecto no ejecuta nada, se define en el docker-compose.yml
CMD ["uvicorn", "microservices.gateway:app", "--host", "0.0.0.0", "--port", "8000"]
