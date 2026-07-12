import subprocess
import time
import sys
import os
import io
from datetime import datetime
from sqlalchemy import create_engine, text

# Safe encoding for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def ensure_database_exists():
    print("[INFO] Verificando base de datos MySQL...", flush=True)
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2') # Spring Boot uses v2 database
    
    BASE_URL = f"mysql+pymysql://{user}:{pwd}@{host}:3306/"
    FULL_URL = f"{BASE_URL}{dbname}"
    
    try:
        engine = create_engine(FULL_URL, connect_args={'connect_timeout': 2})
        with engine.connect() as conn:
            res = conn.execute(text("SHOW TABLES;"))
            tables = res.fetchall()
            
        if len(tables) <= 1:
            print(f"[RESCUE] La base de datos '{dbname}' está VACÍA o DAÑADA ({len(tables)} tablas).")
            print("[INFO] Restaurando base de datos usando el script plan_invierno...")
            subprocess.run([sys.executable, os.path.join("tiradero", "plan_invierno_mysql.py"), "--restore"])
        else:
            print(f"[INFO] Base de datos MySQL '{dbname}' activa con {len(tables)} tablas.")
            
    except Exception as e:
        error_str = str(e)
        if "1049" in error_str or "Unknown database" in error_str:
            print(f"[RESCUE] La base de datos '{dbname}' NO existe en MySQL.")
            print("[INFO] Creando base de datos y restaurando...")
            try:
                temp_engine = create_engine(BASE_URL)
                with temp_engine.connect() as conn:
                    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {dbname}"))
                subprocess.run([sys.executable, os.path.join("tiradero", "plan_invierno_mysql.py"), "--restore"])
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
        critical_collections = [
            'usuarios', 'eventos', 'analytics', 'merchandise', 
            'tickets', 'payments', 'agent_intelligence', 
            'user_behavior_logs', 'ml_predictions', 'nosql_vault_metadata'
        ]
        
        if len(collections) == 0:
            print("[RESCUE] La base de datos MongoDB Atlas está VACÍA.")
            print("[INFO] Restaurando MongoDB usando plan_lia...")
            subprocess.run([sys.executable, os.path.join("tiradero", "plan_lia_mongo.py"), "--restore"])
        else:
            missing_critical = [c for c in critical_collections if c not in collections]
            if missing_critical:
                print(f"[RESCUE] Faltan colecciones críticas: {missing_critical}")
                for coll_name in missing_critical:
                    subprocess.run([sys.executable, os.path.join("tiradero", "plan_lia_mongo.py"), "--restore", coll_name])
            else:
                print(f"[INFO] MongoDB Atlas activa con {len(collections)} colecciones. (Salud OK)")
    except Exception as e:
        print(f"[ERROR] No se pudo verificar salud de MongoDB Atlas: {e}")

# Verificaciones preliminares de DB
ensure_database_exists()
ensure_mongo_exists()

# Crear directorio de logs de Java
log_dir = "microservices2_logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Configuración de microservicios Java
services = [
    {"name": "Gateway Service", "dir": "microservices2/gateway", "port": 8000},
    {"name": "Auth Service", "dir": "microservices2/auth", "port": 8001},
    {"name": "Event Service", "dir": "microservices2/events", "port": 8002},
    {"name": "Ticket Service", "dir": "microservices2/tickets", "port": 8003},
    {"name": "Stats Service", "dir": "microservices2/stats", "port": 8004},
    {"name": "Admin Service", "dir": "microservices2/admin", "port": 8005},
    {"name": "Achievements Service", "dir": "microservices2/achievements", "port": 8006},
    {"name": "Analytics Service", "dir": "microservices2/analytics", "port": 8007},
    {"name": "Merchandise Service", "dir": "microservices2/merchandise", "port": 8008},
]

processes = []

print("\n" + "="*60)
print("   🐾 LAIKA CLUB — INICIANDO MICROSERVICIOS JAVA (SPRING BOOT) 🐾")
print("="*60 + "\n")

is_windows = sys.platform == "win32"
mvn_cmd = "mvnw.cmd" if is_windows else "./mvnw"

for svc in services:
    print(f"[START] Iniciando {svc['name']} en puerto {svc['port']}...")
    log_file_path = f"{log_dir}/{svc['name'].lower().replace(' ', '_')}.log"
    log_file = open(log_file_path, "w", encoding="utf-8")
    
    # Run spring-boot:run using Maven wrapper
    proc = subprocess.Popen(
        [mvn_cmd, "spring-boot:run"],
        cwd=svc['dir'],
        stdout=log_file,
        stderr=log_file,
        shell=is_windows,
        bufsize=1,
        universal_newlines=True
    )
    processes.append((proc, log_file, svc['name']))
    time.sleep(2.0) # Esperar un poco antes de lanzar el siguiente para no saturar la CPU

print("\n" + "="*60)
print("   [SUCCESS] TODOS LOS SERVICIOS JAVA HAN SIDO LANZADOS")
print("   Monitoreando logs en la carpeta 'microservices2_logs/'")
print("   Presiona Ctrl+C para detenerlos todos de forma segura.")
print("="*60 + "\n")

try:
    while True:
        # Check if any process has exited unexpectedly
        for proc, log_file, name in processes:
            exit_code = proc.poll()
            if exit_code is not None:
                print(f"[ALERT] {name} se ha detenido inesperadamente con código de salida: {exit_code}")
        time.sleep(10)
except KeyboardInterrupt:
    print("\n[INFO] Deteniendo todos los servicios Java de forma ordenada...")
    for proc, log_file, name in processes:
        print(f"[STOP] Terminando {name}...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            print(f"[WARN] Forzando detención de {name}...")
            proc.kill()
        log_file.close()
    print("[INFO] Todos los servicios se han detenido correctamente.")
