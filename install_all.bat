@echo off
echo ======================================================
echo   LAIKA CLUB - INSTALADOR DE DEPENDENCIAS COMPLETAS
echo ======================================================
echo.

echo [1/3] Actualizando entorno Conda 'laika'...
call conda env update -f environment.yml
if %ERRORLEVEL% neq 0 (
    echo Error al actualizar el entorno Conda.
    exit /b %ERRORLEVEL%
)

echo [2/3] Instalando dependencias de Node.js (Frontend)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error al instalar dependencias de npm.
    exit /b %ERRORLEVEL%
)

echo [3/3] Verificando dependencias de Python...
call conda activate laika
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Error al verificar dependencias de pip.
    exit /b %ERRORLEVEL%
)

echo.
echo ======================================================
echo   INSTALACION COMPLETADA EXITOSAMENTE
echo   Para iniciar el sistema usa: python run.py
echo ======================================================
pause
