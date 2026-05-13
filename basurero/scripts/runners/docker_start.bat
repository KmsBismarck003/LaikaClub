@echo off
echo ===================================================
echo   LAIKA CLUB - DOCKER STARTUP SYSTEM
echo ===================================================
echo.
echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH.
    pause
    exit /b
)

echo [2/3] Limpiando contenedores antiguos y reconstruyendo...
echo.
docker-compose down --remove-orphans
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al iniciar los contenedores.
    pause
    exit /b
)

echo.
echo [3/3] Sistema Iniciado Correctamente!
echo.
echo [INFO] Gateway: http://localhost:8000
echo [INFO] Auth Service: http://localhost:8001
echo.
echo Mostrando logs en tiempo real (Presiona Ctrl+C para salir de los logs, el sistema seguira corriendo):
echo.
docker-compose logs -f
