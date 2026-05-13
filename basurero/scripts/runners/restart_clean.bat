@echo off
title REINICIADOR DE EMERGENCIA - LAIKA CLUB
color 0e

echo ========================================================
echo   LIMPIANDO PROCESOS Y REINICIANDO MICROSERVICIOS
echo ========================================================
echo.

:: 1. Matar procesos de Python y Uvicorn
echo [*] Cerrando procesos de Python y Uvicorn detectados...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im uvicorn.exe /t 2>nul
echo [OK] Procesos detenidos.

:: 2. Limpiar cache de gateway (opcional)
if exist gateway_cache.json del gateway_cache.json

:: 3. Espera de seguridad
echo [*] Liberando puertos (3s)...
timeout /t 3 /nobreak >nul

:: 4. Reiniciar con run_all.bat
echo [*] Lanzando sistema completo...
start run_all.bat

echo.
echo ========================================================
echo [EXITO] El sistema se ha reiniciado con los parches de:
echo - Login (Gmail/Custom Domains)
echo - Bcrypt Compatibility
echo - Routing Normalize
echo.
echo Ya puedes probar el login en el navegador.
echo ========================================================
pause
