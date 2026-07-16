FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias del sistema, incluyendo Java para que PySpark funcione
RUN apt-get update && apt-get install -y \
    default-jre \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/default-java

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponemos el motor en el puerto 8009 para no chocar con Java (8007)
EXPOSE 8009

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8009"]
