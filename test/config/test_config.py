"""
Módulo de Configuración Central para QA Automation - LaikaClub
Define URLs de microservicios, bases de datos, credenciales seguras de prueba y rutas.
"""
import os
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent

# URLs de Microservicios y Gateway
GATEWAY_URL = os.getenv(
    "GATEWAY_URL",
    "https://laikaclub-pqxdo7.westus.cloudapp.azure.com"
).rstrip("/")
FRONTEND_URL = os.getenv("FRONTEND_URL", GATEWAY_URL).rstrip("/")

# Public microservice routes are exposed through Pilgrim; container ports are private.
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", f"{GATEWAY_URL}/api/auth").rstrip("/")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", f"{GATEWAY_URL}/api/admin").rstrip("/")
STATS_SERVICE_URL = os.getenv("STATS_SERVICE_URL", f"{GATEWAY_URL}/api/stats").rstrip("/")
EVENTS_SERVICE_URL = os.getenv("EVENTS_SERVICE_URL", f"{GATEWAY_URL}/api/events").rstrip("/")
TICKETS_SERVICE_URL = os.getenv("TICKETS_SERVICE_URL", f"{GATEWAY_URL}/api/tickets").rstrip("/")
MERCHANDISE_SERVICE_URL = os.getenv("MERCHANDISE_SERVICE_URL", f"{GATEWAY_URL}/api/merchandise").rstrip("/")
ACHIEVEMENTS_SERVICE_URL = os.getenv("ACHIEVEMENTS_SERVICE_URL", f"{GATEWAY_URL}/api/achievements").rstrip("/")
ANALYTICS_SERVICE_URL = os.getenv("ANALYTICS_SERVICE_URL", f"{GATEWAY_URL}/api/analytics").rstrip("/")
BIGDATA_SERVICE_URL = os.getenv("BIGDATA_SERVICE_URL", f"{GATEWAY_URL}/api/analytics").rstrip("/")

_gateway_host = urlparse(GATEWAY_URL).hostname or ""
_default_environment = "Azure (producción)" if _gateway_host.endswith(".cloudapp.azure.com") else "Entorno configurado"
TEST_ENVIRONMENT = os.getenv("TEST_ENVIRONMENT", _default_environment)

# Parámetros de Base de Datos MySQL
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
DB_HOST = MYSQL_HOST
DB_PORT = MYSQL_PORT
DB_USER = MYSQL_USER
DB_PASSWORD = MYSQL_PASSWORD

TIMEOUT_DEFAULT = int(os.getenv("TIMEOUT_DEFAULT", "10"))

# Credenciales de usuario exclusivo de testing (Rol USUARIO)
QA_USER_EMAIL = os.getenv("QA_USER_EMAIL", "qa_user_test@laikaclub.com")
QA_USER_PASSWORD = os.getenv("QA_USER_PASSWORD", "TestQA123!")

# Credenciales de administrador exclusivo de testing (Rol ADMIN)
QA_ADMIN_EMAIL = os.getenv("QA_ADMIN_EMAIL", "admin@laikaclub.com")
QA_ADMIN_PASSWORD = os.getenv("QA_ADMIN_PASSWORD", "gearsof2")

# Credenciales de gestor/organizador exclusivo de testing (Rol GESTOR)
QA_GESTOR_EMAIL = os.getenv("QA_GESTOR_EMAIL", "gestor@laikaclub.com")
QA_GESTOR_PASSWORD = os.getenv("QA_GESTOR_PASSWORD", "gearsof2")

# Credenciales de operador/staff exclusivo de testing (Rol OPERADOR)
QA_OPERADOR_EMAIL = os.getenv("QA_OPERADOR_EMAIL", "operador@laikaclub.com")
QA_OPERADOR_PASSWORD = os.getenv("QA_OPERADOR_PASSWORD", "gearsof2")

# Rutas del Sistema de QA
CASOS_DIR = BASE_DIR / "resultados" / "casos"
CASOS_USUARIO_DIR = CASOS_DIR / "usuario"
CASOS_ADMIN_DIR = CASOS_DIR / "admin"
CASOS_GESTOR_DIR = CASOS_DIR / "gestor"
CASOS_OPERADOR_DIR = CASOS_DIR / "operador"
CASOS_AVANZADOS_DIR = CASOS_DIR / "avanzados"

EVIDENCIAS_DIR = BASE_DIR / "evidencias"
EVIDENCIAS_USUARIO_DIR = EVIDENCIAS_DIR / "usuario"
EVIDENCIAS_ADMIN_DIR = EVIDENCIAS_DIR / "admin"
EVIDENCIAS_GESTOR_DIR = EVIDENCIAS_DIR / "gestor"
EVIDENCIAS_OPERADOR_DIR = EVIDENCIAS_DIR / "operador"
EVIDENCIAS_AVANZADOS_DIR = EVIDENCIAS_DIR / "avanzados"

REPORTES_DIR = BASE_DIR / "reportes"

