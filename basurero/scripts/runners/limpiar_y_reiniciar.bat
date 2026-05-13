@echo off
title REINICIADOR MAESTRO - LAIKA CLUB
color 0b

echo ========================================================
echo   LIMPIANDO Y REINICIANDO SISTEMAS LAIKA CLUB
echo ========================================================
echo.

:: 1. Matar procesos de Python y Uvicorn
echo [*] Cerrando procesos de Python antiguos para liberar puertos...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im uvicorn.exe /t 2>nul
echo [OK] Procesos detenidos.

:: 2. Espera breve para asegurar que los sockets se liberen
echo [*] Esperando 3 segundos para liberacion de puertos...
timeout /t 3 /nobreak >nul

:: 3. Reiniciar el sistema
echo [*] Lanzando sistema completo en nuevas ventanas...
start run_all.bat

echo.
echo ========================================================
echo [EXITO] Los servicios se estan reiniciando en ventanas
echo separadas con el CODIGO ACTUALIZADO y el PARCHE activo.
echo.
echo Puedes cerrar esta ventana.
echo ========================================================
pause
