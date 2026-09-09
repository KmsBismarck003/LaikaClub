@echo off
title LAIKA CLUB - Servidor de Pruebas y Sistema Completo Desacoplado
cls

echo =========================================================================
echo       🐾  LAIKA CLUB - INICIADOR DEL SISTEMA COMPLETO Y ROLES  🐾
echo =========================================================================
echo.

:: 1. Crear carpeta de logs en tiradero\logpruebas
set LOG_DIR=%~dp0tiradero\logpruebas
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [INFO] Directorio de logs verificado: %LOG_DIR%
echo.

:: 2. Iniciar Microservicios de Java y Wearables (Backend Completo)
echo [1/5] Iniciando MICROSERVICIOS Y SERVICIOS BACKEND...
start "Java Microservices (8000+)" /min cmd /c "cd /d "%~dp0" && "%~dp0.venv\Scripts\python.exe" run_microservices_java.py"
timeout /t 2 /nobreak >nul

:: 3. Iniciar API Gateway Pilgrim (Puerto 8000)
echo [2/5] Iniciando PILGRIM API GATEWAY en http://localhost:8000 ...
start "Pilgrim API Gateway (8000)" /min cmd /c "cd /d "%~dp0" && "%~dp0.venv\Scripts\python.exe" pilgrim\run_pilgrim.py > "%LOG_DIR%\api_gateway.log" 2>&1"
timeout /t 5 /nobreak >nul

:: 4. Iniciar laika-admin (Puerto 3010 - Rango Admin 3010-3019)
echo [3/5] Iniciando Rol ADMINISTRADOR (laika-admin) en http://localhost:3010 ...
start "Laika Admin (3010)" /min cmd /c "cd /d "%~dp0laika-admin" && npm run dev > "%LOG_DIR%\frontend_admin.log" 2>&1"

:: 5. Iniciar laika-gestor (Puerto 3020 - Rango Gestor 3020-3029)
echo [4/5] Iniciando Rol GESTOR (laika-gestor) en http://localhost:3020 ...
start "Laika Gestor (3020)" /min cmd /c "cd /d "%~dp0laika-gestor" && npm run dev > "%LOG_DIR%\frontend_gestor.log" 2>&1"

:: 6. Iniciar laika-operador (Puerto 3030 - Rango Operador 3030-3039)
echo [5/5] Iniciando Rol OPERADOR (laika-operador) en http://localhost:3030 ...
start "Laika Operador (3030)" /min cmd /c "cd /d "%~dp0laika-operador" && npm run dev > "%LOG_DIR%\frontend_operador.log" 2>&1"

echo.
echo [INFO] Esperando 5 segundos para la inicializacion completa de la API y los Servidores...
timeout /t 5 /nobreak >nul

:: 6. Abrir las 3 pestañas de los roles en el navegador predeterminado
echo.
echo [INFO] Abriendo las 3 aplicaciones en el navegador web...
start "" "http://localhost:3010"
start "" "http://localhost:3020"
start "" "http://localhost:3030"

echo.
echo =========================================================================
echo  ✅ ¡SISTEMA DESACOPLADO Y API GATEWAY ACTIVOS Y LISTOS!
echo.
echo  🚀 API Gateway: http://localhost:8000
echo  🌐 Admin:       http://localhost:3010 (Rango Admin: 3010-3019)
echo  🌐 Gestor:      http://localhost:3020 (Rango Gestor: 3020-3029)
echo  🌐 Operador:    http://localhost:3030 (Rango Operador: 3030-3039)
echo.
echo  📁 REGISTRO DE LOGS EN TIEMPO REAL:
echo     %LOG_DIR%\
echo       ├── api_gateway.log       (Logs de peticiones HTTP del Gateway)
echo       ├── errores_sistema.log   (Errores 404, 500 y fallos)
echo       ├── frontend_admin.log    (Logs de laika-admin)
echo       ├── frontend_gestor.log   (Logs de laika-gestor)
echo       └── frontend_operador.log (Logs de laika-operador)
echo =========================================================================
echo.
pause
