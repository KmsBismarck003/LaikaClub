import os
import sys
import json
import time
import io
from datetime import datetime

# Safe encoding for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ==========================================
# 🦊 PLAN LIA - MONGODB ATLAS DISASTER RECOVERY
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
        with open(env_path, 'r') as f:
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
    print("  [INFO]  SISTEMA DE RECUPERACION - PLAN LIA  ")
    print("       (Recuperacion Quirurgica en Atlas)       ")
    print("="*50)

def validate_backup_integrity(filepath):
    """Valida que el archivo JSON esté íntegro parseándolo antes de importar."""
    print(f"[*] Validando integridad de {os.path.basename(filepath)}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Formato Laika Multi-Coleccion (Dict con varias listas)
            if isinstance(data, dict):
                valid_collections = {k: v for k, v in data.items() if isinstance(v, list) and not k.startswith('_')}
                if valid_collections:
                    print(f"[✅] Detectadas {len(valid_collections)} colecciones en el respaldo.")
                    return valid_collections
                
                # Fallback: Objeto unico
                print(f"[✅] Integridad OK (Objeto único). 1 documento listo.")
                return {"analytics": [data]}
            
            if isinstance(data, list):
                print(f"[✅] Integridad OK. {len(data)} documentos listos.")
                return {"analytics": data}
            
            print("[❌] Formato de respaldo inválido.")
            return None
    except Exception as e:
        print(f"[❌] Error de integridad: {str(e)}")
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
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Forzar conexión
        client.server_info()
        print("[✅] Conexión a MongoDB Atlas Exitosa.")
        db = client[db_name]
    except Exception as e:
        print(f"[❌] Error crítico al conectar a Atlas: {str(e)}")
        sys.exit(1)

    # 1. Buscar Respaldos
    possible_dirs = [
        os.path.join(os.path.dirname(__file__), 'backups'),
        os.path.join(os.path.dirname(__file__), 'data', 'backups'),
        '.'
    ]
    
    backup_files = []
    for d in possible_dirs:
        if os.path.exists(d):
            backup_files += [os.path.join(d, f) for f in os.listdir(d) if f.endswith('.json') and 'backup' in f.lower()]

    if not backup_files:
         print("[⚠️] ADVERTENCIA: No se encontraron archivos .json de respaldo.")
         print("    Asegúrate de tener respaldos en 'backups/', 'data/backups/' o la raíz.")
         sys.exit(1)

    # 2. Argumentos
    action = sys.argv[1] if len(sys.argv) > 1 else '--restore'
    arg2 = sys.argv[2] if len(sys.argv) > 2 else None
    
    latest_backup = None
    target_coll = None

    # Si el segundo argumento es un archivo existente
    if arg2 and os.path.isfile(arg2):
        latest_backup = arg2
    else:
        # Es un nombre de colección o nulo
        target_coll = arg2
        if target_coll:
            backup_files = [f for f in backup_files if target_coll.lower() in os.path.basename(f).lower()]
            if not backup_files:
                print(f"[❌] Error: No se encontró ningún respaldo JSON para la colección '{target_coll}'")
                sys.exit(1)
        
        backup_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        if backup_files:
            latest_backup = backup_files[0]

    if not latest_backup:
        print("[❌] Error: No hay archivos de respaldo disponibles.")
        sys.exit(1)
    
    # Si no se pasó colección, intentar detectarla del contenido o nombre
    if not target_coll:
        # Lógica de detección por contenido
        try:
             with open(latest_backup, "r", encoding="utf-8") as f:
                  peek = json.load(f)
                  # Extraer lista si es snapshot
                  if isinstance(peek, dict) and len(peek) == 1:
                       peek = peek[list(peek.keys())[0]]
                  
                  if isinstance(peek, list) and len(peek) > 0:
                       sample = peek[0]
                       if 'ticket_code' in sample: target_coll = 'tickets'
                       elif 'user_id' in sample or 'username' in sample: target_coll = 'usuarios'
                       elif 'event_id' in sample and 'title' in sample: target_coll = 'eventos'
                       elif 'price' in sample and 'stock' in sample: target_coll = 'merchandise'
                       elif 'transaction_id' in sample: target_coll = 'payments'
        except:
             pass

    # Si aún no hay colección, usar fallback por nombre
    if not target_coll:
        target_coll = os.path.basename(latest_backup).replace('.json', '').replace('_backup', '').replace('backup_', '')
        import re
        target_coll = re.sub(r'_\d{8}_\d{6}.*', '', target_coll)
        target_coll = target_coll.replace('backup_mongo_', '').replace('mongo_', '')
        if not target_coll or target_coll == 'mongo': target_coll = 'analytics'

    print(f"[✅] Respaldo seleccionado: {os.path.basename(latest_backup)}")
    print(f"[*] Colección objetivo: {target_coll}")

    if action == '--validate':
         print(f"\n[🛡️] Modo Validación para Colección: '{target_coll}'")
         validate_backup_integrity(latest_backup)
         
    elif action == '--restore':
         print(f"\n[🚨] INICIANDO RECUPERACIÓN QUIRÚRGICA")
         
         all_data = validate_backup_integrity(latest_backup)
         if not all_data:
              print("[❌] Abortando restauración por falla de integridad.")
              sys.exit(1)

         # Si se especificó una colección, filtrar
         if target_coll and target_coll in all_data:
             all_data = {target_coll: all_data[target_coll]}
         elif target_coll:
             # Buscar por coincidencia parcial
             match = next((k for k in all_data.keys() if target_coll.lower() in k.lower()), None)
             if match:
                 all_data = {match: all_data[match]}
             else:
                 print(f"[⚠️] Coleccion '{target_coll}' no encontrada en backup. Restaurando todo.")

         for original_key, docs in all_data.items():
             print(f"\n[*] Procesando origen: '{original_key}' ({len(docs)} documentos)")
             
             for doc in docs:
                  # Determinar colección destino por campos
                  target = "analytics"
                  if 'ticket_code' in doc: target = "tickets"
                  elif 'username' in doc or 'email' in doc: target = "usuarios"
                  elif 'event_id' in doc and 'title' in doc: target = "eventos"
                  elif 'precio' in doc or 'stock' in doc: target = "merchandise"
                  elif 'transaction_id' in doc: target = "payments"
                  
                  coll = db[target]
                  try:
                       if '_id' in doc:
                            coll.update_one({'_id': doc['_id']}, {'$setOnInsert': doc}, upsert=True)
                       else:
                            coll.insert_one(doc)
                       inserted_count += 1
                  except:
                       pass
             
             print(f"    - Datos distribuidos exitosamente.")

         print("\n" + "="*50)
         print("   🎉  [PLAN LIA COMPLETADO CON ÉXITO]  🎉   ")
         print("="*50)

if __name__ == '__main__':
    if len(sys.argv) == 1:
         print("Uso: python plan_lia_mongo.py [--validate | --restore] [nombre_coleccion]")
    main()
