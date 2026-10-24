#!/bin/bash
set -e

# ==============================================================================
# SCRIPT DE APROVISIONAMIENTO AUTOMÁTICO (CLOUD-INIT) - LAIKA CLUB PRODUCCIÓN
# ==============================================================================

echo ">>> [1/5] Configurando memoria SWAP de 8 GB en SSD..."
if [ ! -f /swapfile ]; then
    fallocate -l 8G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

echo ">>> [2/5] Actualizando paquetes e instalando dependencias base..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    docker.io \
    docker-compose

echo ">>> [3/5] Habilitando Docker y usuario de administración..."
systemctl enable docker
systemctl start docker
usermod -aG docker azureuser

echo ">>> [4/5] Instalando Node.js 20 LTS (necesario para compilación de frontends)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo ">>> [5/5] Creando estructura de directorios /app/laika..."
mkdir -p /app/laika
mkdir -p /var/www/laika-web
mkdir -p /var/www/laika-admin
mkdir -p /var/www/laika-gestor
mkdir -p /var/www/laika-operador
chown -R azureuser:azureuser /app
chown -R azureuser:www-data /var/www

echo ">>> Aprovisionamiento base completado con éxito."
