import os
import sys
import json
import time
import io
from datetime import datetime

# Safe encoding for Windows console output
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ==========================================
# PLAN LIA - MONGODB ATLAS DISASTER RECOVERY
# ==========================================

# Auto-instalador de PyMongo para evitar fallos de librerías
try:
    from pymongo import MongoClient, errors
except ImportError:
    print("[*] Librería 'pymongo' no detectada. Instalando...")
    import subprocess
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pymongo"])
        from pymongo import MongoClient, errors
        print("[✅] PyMongo instalado con éxito!")
    except Exception as e:
        print(f"[❌] Error al instalar pymongo: {e}")
        sys.exit(1)

def load_env():
    """Carga variables de entorno manuales desde archivo .env"""
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    # Dividir solo en el primer '='
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        key, value = parts
                        # Quitar comillas si existen
                        if value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        env_vars[key] = value
    return env_vars

def print_banner():
    print("="*50)
    print("  🦊  SISTEMA DE RECUPERACIÓN - PLAN LIA 🦊  ")
    print("       (Recuperación Quirúrgica en Atlas)       ")
    print("="*50)

def validate_backup_integrity(filepath):
    """Valida que el archivo JSON esté íntegro parseándolo antes de importar."""
    print(f"[*] Validando integridad de {os.path.basename(filepath)}...")
    try:
        from bson import json_util
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json_util.loads(f.read())
            # Puede ser una lista de documentos de una colección
            # O un diccionario de colecciones (formato de backup oficial de Laika)
            if isinstance(data, (list, dict)):
                print(f"[✅] Integridad OK. Datos parseados correctamente.")
                return data
            else:
                print("[❌] Formato de respaldo inválido (No es un JSON Array ni Object).")
                return None
    except Exception as e:
        print(f"[❌] ERROR DE INTEGRIDAD o Lectura: {str(e)}")
        return None

def main():
    print_banner()
    env = load_env()
    
    mongo_uri = env.get('MONGO_URI')
    db_name = env.get('MONGO_DB', 'laika_analytics')

    if not mongo_uri:
        print("[❌] ERROR: No se encontró MONGO_URI en el archivo .env")
        sys.exit(1)

    print(f"[*] Conectando a MongoDB Atlas...")
    print(f"    - Base de Datos: {db_name}")
    print("-" * 50)

    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        # Forzar conexión
        client.server_info()
        print("[✅] Conexión a MongoDB Atlas Exitosa.")
        db = client[db_name]
    except Exception as e:
        print(f"[❌] Error crítico al conectar a Atlas: {str(e)}")
        sys.exit(1)

    # 1. Buscar Respaldos
    backup_files = []
    backups_dir = os.path.join(os.path.dirname(__file__), 'backups')
    
    if os.path.exists(backups_dir):
        backup_files += [os.path.join(backups_dir, f) for f in os.listdir(backups_dir) if f.endswith('.json')]
        
    backup_files += [f for f in os.listdir('.') if f.endswith('.json') and 'backup' in f.lower()]

    if not backup_files:
        print("[⚠️] ADVERTENCIA: No se encontraron archivos .json de respaldo.")
        print("    Asegúrate de tener un archivo como 'backups/*.json' creado.")
        sys.exit(1)

    backup_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    latest_backup = backup_files[0]
    print(f"[✅] Respaldo más reciente encontrado: {os.path.basename(latest_backup)}")

    # 2. Argumentos
    action = sys.argv[1] if len(sys.argv) > 1 else '--restore'
    # Si especificamos una colección a restaurar
    target_coll = sys.argv[2] if len(sys.argv) > 2 else None

    if action == '--validate':
        print(f"\n[🛡️] Modo Validación")
        validate_backup_integrity(latest_backup)
         
    elif action == '--restore':
        # Validar primero
        valid_data = validate_backup_integrity(latest_backup)
        if not valid_data:
            print("[❌] Abortando restauración por falla de integridad.")
            sys.exit(1)

        # Si los datos son un diccionario que contiene colecciones
        # Formato: { "usuarios": [...], "eventos": [...] }
        if isinstance(valid_data, dict) and not (target_coll and target_coll in valid_data and isinstance(valid_data[target_coll], list) and not any(isinstance(v, list) for v in valid_data.values())):
            # Es un backup completo (multi-colección)
            collections_to_restore = [target_coll] if target_coll else list(valid_data.keys())
            
            print(f"\n[🚨] INICIANDO RESTAURACIÓN MULTI-COLECCIÓN EN: {db_name}")
            for coll_name in collections_to_restore:
                if coll_name not in valid_data:
                    print(f"[⚠️] Colección '{coll_name}' no encontrada en el archivo de respaldo. Saltando...")
                    continue
                
                docs = valid_data[coll_name]
                if not docs:
                    print(f"[*] Colección '{coll_name}' está vacía en el respaldo. Saltando...")
                    continue
                    
                print(f"[*] Procesando colección '{coll_name}' (Restaurando {len(docs)} documentos)...")
                coll = db[coll_name]
                
                # Dropear colección para sobreescribir limpio (o hacer upsert)
                coll.drop()
                try:
                    coll.insert_many(docs)
                    print(f"    - [✅] Colección '{coll_name}' restaurada exitosamente.")
                except Exception as ex:
                    print(f"    - [❌] Error al restaurar '{coll_name}': {ex}")
                    
        else:
            # Es un backup simple (un solo array de documentos)
            if not target_coll:
                # Intentar adivinar el nombre por el nombre del archivo
                target_coll = os.path.basename(latest_backup).replace('.json', '').replace('_backup', '').replace('backup_', '')
                
            print(f"\n[🚨] INICIANDO RECUPERACIÓN QUIRÚRGICA SIMPLE: {db_name} -> {target_coll}")
            
            docs_list = valid_data if isinstance(valid_data, list) else [valid_data]
            coll = db[target_coll]
            
            # Dropear previo
            coll.drop()
            try:
                coll.insert_many(docs_list)
                print(f"[✅] Colección '{target_coll}' restaurada con éxito ({len(docs_list)} docs).")
            except Exception as ex:
                print(f"[❌] Error al restaurar '{target_coll}': {ex}")

        print("\n" + "="*50)
        print("   🎉  [PLAN LIA COMPLETADO CON ÉXITO]  🎉   ")
        print("="*50)

if __name__ == '__main__':
    main()
