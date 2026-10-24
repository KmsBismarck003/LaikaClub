@echo off
title LAIKA CLUB - TUNEL GLOBAL PARA LAIKAMOBIL
cls

echo =========================================================================
echo       🌐  LAIKA CLUB - TÚNEL GLOBAL PARA EXPO GO (LAIKAMOBIL)  🌐
echo =========================================================================
echo.
echo  Este script crea un tunel seguro y publico (HTTPS) hacia tu API Gateway
echo  Pilgrim (puerto 8000).
echo.
echo  Con esto activo:
echo   - Tu celular puede estar en DATOS MOVILES (4G/5G) o cualquier red Wi-Fi.
echo   - No importa si cambias de red: el tunel se autoreconecta.
echo   - Tu app LaikaMobil se comunicara fluidamente con todos los microservicios.
echo.
echo  Verificando API Gateway Pilgrim en puerto 8000...
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo  [!] AVISO: El servidor Pilgrim no parece estar corriendo todavia en el puerto 8000.
    echo      Asegurate de haber ejecutado 'docker-compose up' o 'iniciar_roles_desacoplados.bat'.
    echo.
) else (
    echo  [OK] Pilgrim API Gateway detectado en el puerto 8000.
    echo.
)

:bucle_tunel
echo -------------------------------------------------------------------------
echo  Conectando tunel publico con subdominio: laika-pilgrim-dev ...
echo  URL esperada: https://laika-pilgrim-dev.loca.lt
echo -------------------------------------------------------------------------
echo.
echo  Para detener el tunel, presiona Ctrl + C en esta ventana.
echo.

npx --yes localtunnel --port 8000 --local-host 127.0.0.1 --subdomain laika-pilgrim-dev

echo.
echo [!] El tunel se desconecto (posible cambio de red o microcorte).
echo     Reintentando conexion automatica en 3 segundos...
timeout /t 3 /nobreak >nul
goto bucle_tunel
