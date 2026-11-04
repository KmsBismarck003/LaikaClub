#!/bin/bash
set -e

# ==============================================================================
# SCRIPT MAESTRO DE DESPLIEGUE EN PRODUCCIÓN - LAIKA CLUB (AZURE VM)
# ==============================================================================
# Uso en el servidor:
#   cd /app/laika
#   sudo bash deploy_remote.sh
# ==============================================================================

echo "========================================================================"
echo "🐾 INICIANDO DESPLIEGUE EN PRODUCCIÓN: LAIKA CLUB 🐾"
echo "========================================================================"

APP_DIR="/app/laika"
BRANCH="development"

cd "$APP_DIR"

# 1. Asegurar clonación o actualización de Pilgrim API Gateway (Repositorio Independiente)
echo ">>> [1/6] Sincronizando Pilgrim API Gateway..."
if [ ! -d "$APP_DIR/pilgrim/.git" ]; then
    rm -rf "$APP_DIR/pilgrim"
    git clone -b "$BRANCH" https://github.com/KmsBismarck003/PilgrimAPI.git "$APP_DIR/pilgrim"
else
    cd "$APP_DIR/pilgrim"
    git fetch origin "$BRANCH"
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
    cd "$APP_DIR"
fi

# 2. Configurar variables de entorno de producción si no existen
echo ">>> [2/6] Verificando variables de entorno (.env.production)..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production"
    echo "  [AVISO] Se generó .env.production desde la plantilla. Edítalo si requieres claves específicas."
fi

# 3. Crear directorios de uploads y backups si no existen
mkdir -p "$APP_DIR/uploads" "$APP_DIR/backups"
chmod -R 775 "$APP_DIR/uploads" "$APP_DIR/backups"

# 4. Configurar y reiniciar NGINX
echo ">>> [3/6] Configurando NGINX Reverse Proxy..."
if [ -f "$APP_DIR/nginx-laika.conf" ]; then
    cp "$APP_DIR/nginx-laika.conf" /etc/nginx/sites-available/default
    nginx -t
    systemctl restart nginx
    echo "  [OK] NGINX configurado y activo."
fi

# 5. Opcional: Compilar Frontends en la VM si se desea opción All-in-One
# (Si usas Vercel, este paso se puede omitir o ejecutar para respaldo local)
if [ "$1" == "--build-frontends" ]; then
    echo ">>> [4/6] Compilando aplicaciones Frontend locales..."
    
    # Sincronizar roles desacoplados
    for role in laika-admin laika-gestor laika-operador; do
        if [ ! -d "$APP_DIR/$role/.git" ]; then
            rm -rf "$APP_DIR/$role"
            git clone -b "$BRANCH" "https://github.com/KmsBismarck003/$role.git" "$APP_DIR/$role"
        else
            cd "$APP_DIR/$role" && git checkout "$BRANCH" && git pull origin "$BRANCH" && cd "$APP_DIR"
        fi
        
        echo "  Compilando $role..."
        cd "$APP_DIR/$role"
        npm install --prefer-offline --no-audit
        npm run build
        mkdir -p "/var/www/$role"
        cp -r dist/* "/var/www/$role/"
        cd "$APP_DIR"
    done

    # Compilar Web Principal
    echo "  Compilando laika-web principal..."
    npm install --legacy-peer-deps --prefer-offline --no-audit
    npm run build
    mkdir -p /var/www/laika-web
    cp -r build/* /var/www/laika-web/
    
    # Compilar MATIS SolidJS si existe
    if [ -d "$APP_DIR/matis-solid" ]; then
        echo "  Compilando matis-solid..."
        cd "$APP_DIR/matis-solid"
        npm install --prefer-offline --no-audit
        npm run build
        mkdir -p /var/www/laika-matis
        cp -r dist/* /var/www/laika-matis/
        cd "$APP_DIR"
    fi
else
    echo ">>> [4/6] Omitiendo compilación de frontends (se sirven vía Vercel CDN)."
    echo "          (Para compilar todo en la VM, corre: sudo bash deploy_remote.sh --build-frontends)"
fi

# 6. Levantar Microservicios, Pilgrim y MySQL con Docker
echo ">>> [5/6] Levantando clúster de microservicios con Docker Compose..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Verificación de Salud
echo ">>> [6/6] Verificando salud del sistema..."
sleep 15

HEALTH_STATUS=$(curl -s http://127.0.0.1:8000/api/health || echo '{"status":"starting"}')
echo "Estado de Pilgrim Gateway: $HEALTH_STATUS"

echo "========================================================================"
echo "✅ ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!"
echo "   Gateway: http://127.0.0.1:8000/api"
echo "   MySQL:   127.0.0.1:3306"
echo "========================================================================"

