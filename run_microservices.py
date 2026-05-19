import subprocess
import time
import sys
import os
import io
import glob
from datetime import datetime
from sqlalchemy import create_engine, text
from pymongo import MongoClient

# Safe encoding for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def ensure_database_exists():
    print("[INFO] Verificando base de datos MySQL...", flush=True)
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    BASE_URL = f"mysql+pymysql://{user}:{pwd}@{host}:3306/"
    FULL_URL = f"{BASE_URL}{dbname}"
    
    try:
        engine = create_engine(FULL_URL, connect_args={'connect_timeout': 2})
        with engine.connect() as conn:
            # 💡 NUEVA REGLA: Verificar si hay tablas creadas
            res = conn.execute(text("SHOW TABLES;"))
            tables = res.fetchall()
                   if len(tables) <= 1: # Si está vacía o tiene sólo 1 tabla
            print(f"[RESCUE] La base de datos '{dbname}' está VACÍA o DAÑADA ({len(tables)} tablas).")
            print("[WARNING] El script de auto-restauración 'plan_invierno_mysql.py' no está disponible en este entorno.")
        else:
            print(f"[INFO] Base de datos MySQL '{dbname}' activa con {len(tables)} tablas.")
            
    except Exception as e:
        error_str = str(e)
        if "1049" in error_str or "Unknown database" in error_str:
            print(f"[RESCUE] La base de datos '{dbname}' NO existe en MySQL.")
            print("[INFO] Creando base de datos...")
            try:
                temp_engine = create_engine(BASE_URL)
                with temp_engine.connect() as conn:
                    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {dbname}"))
                print("[WARNING] El script de auto-restauración 'plan_invierno_mysql.py' no está disponible.")
            except Exception as e2:
                print(f"[ERROR] Fallo crítico al crear DB: {e2}")
        else:
            print(f"[ERROR] No se pudo verificar salud de MySQL: {e}")
def ensure_mongo_exists():
    print("[INFO] Verificando base de datos MongoDB Atlas...")
    try:
        from pymongo import MongoClient
        
        raw_uri = os.getenv("MONGO_URI", "").strip('"')
        if not raw_uri:
            return
            
        client = MongoClient(
            raw_uri, 
            serverSelectionTimeoutMS=3000,
            tlsAllowInvalidCertificates=True
        )
        dbname = os.getenv("MONGO_DB", "laika_analytics")
        mongo_db = client[dbname]
        
        collections = mongo_db.list_collection_names()
        
        # Colecciones Críticas del Sistema Laika
        # Colecciones Críticas del Sistema Laika (Ecosistema Total)
        critical_collections = [
            'usuarios', 'eventos', 'analytics', 'merchandise', 
            'tickets', 'payments', 'agent_intelligence', 
            'user_behavior_logs', 'ml_predictions', 'nosql_vault_metadata'
        ]
        
        if len(collections) == 0:
            print("[RESCUE] 🦊 La base de datos MongoDB Atlas está VACÍA.")
            print("[WARNING] El script de auto-restauración 'plan_lia_mongo.py' no está disponible.")
        else:
            # Verificación Granular (Súrgica)
            missing_critical = [c for c in critical_collections if c not in collections]
            
            if missing_critical:
                print(f"[RESCUE] 🦊 Faltan colecciones críticas: {missing_critical}")
                print("[WARNING] El script de restauración 'plan_lia_mongo.py' no está disponible.")
            else:
                print(f"[INFO] MongoDB Atlas activa con {len(collections)} colecciones. (Salud OK)")
             
    except Exception as e:
        print(f"[ERROR] No se pudo verificar salud de MongoDB Atlas: {e}")

# Ejecutar verificación antes de lanzar los microservicios
ensure_database_exists()
ensure_mongo_exists()

# Crear carpeta de logs si no existe
if not os.path.exists("microservices_logs"):
    os.makedirs("microservices_logs")

services = [
    {"name": "API Gateway", "path": "microservices/gateway.py", "port": 8000},
    {"name": "Auth Service", "path": "microservices/auth/main.py", "port": 8001},
    {"name": "Event Service", "path": "microservices/events/main.py", "port": 8002},
    {"name": "Ticket Service", "path": "microservices/tickets/main.py", "port": 8003},
    {"name": "Stats Service", "path": "microservices/stats/main.py", "port": 8004},
    {"name": "Admin Service", "path": "microservices/admin/main.py", "port": 8005},
    {"name": "Achievements Service", "path": "microservices/achievements/main.py", "port": 8006},
    {"name": "Analytics Big Data", "path": "microservices/analytics_bigdata/main.py", "port": 8007},
    {"name": "Merchandise Service", "path": "microservices/merchandise/main.py", "port": 8008},
]

processes = []

print("[INFO] Iniciando Microservicios de Laika Events...")
print("="*50)

for svc in services:
    print(f"[START] Arrancando {svc['name']} en puerto {svc['port']}...")
    # Formato: microservices.auth.main:app
    module_app = svc['path'].replace('/', '.').replace('\\', '.').replace('.py', '') + ":app"
    
    # Redirigir salida a carpeta microservices_logs
    log_file = open(f"microservices_logs/{svc['name'].lower().replace(' ', '_')}.log", "w")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", module_app, "--host", "0.0.0.0", "--port", str(svc['port']), "--reload"],
        stdout=log_file,
        stderr=log_file,
        bufsize=1,
        universal_newlines=True
    )
    processes.append((proc, log_file))
    time.sleep(1.5)

print("="*50)
print("[SUCCESS] TODOS LOS SERVICIOS ESTAN CORRIENDO!")
print("[INFO] Presiona Ctrl+C para detenerlos todos.")

try:
    print("\n" + "="*50)
    print("  [SISTEMA DE MONITOREO EN TIEMPO REAL ACTIVADO]")
    print("="*50 + "\n")
    
    while True:
        # Ejecutar verificaciones silenciosas pero informativas
        print(f"[*] [{datetime.now().strftime('%H:%M:%S')}] Escaneando salud de Bases de Datos...")
        ensure_database_exists()
        ensure_mongo_exists()
        print("-" * 30)
        time.sleep(10) # Checar cada 10 segundos
except KeyboardInterrupt:
    print("\n[INFO] Deteniendo servicios...")
    for proc_tuple in processes:
        proc_tuple[0].terminate()
    print("[INFO] Sistema detenido.")
