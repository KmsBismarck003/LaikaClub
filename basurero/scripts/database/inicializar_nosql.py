# -*- coding: utf-8 -*-
"""
LAIKA CLUB - INICIALIZADOR DE ECOSISTEMA NOSQL
Crea las 10 colecciones críticas en Atlas con metadatos base.
"""
import os
import sys
import io
from datetime import datetime
from pymongo import MongoClient

# Safe encoding for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars

def main():
    print("="*55)
    print("  🚀 INICIALIZADOR DE ECOSISTEMA NOSQL - LAIKA CLUB 🚀")
    print("="*55)

    env = load_env()
    mongo_uri = env.get('MONGO_URI')
    db_name = env.get('MONGO_DB', 'laika_analytics')

    if not mongo_uri:
        print("[❌] ERROR: No se encontró MONGO_URI en .env")
        return

    import ssl
    try:
        print(f"[*] Conectando a MongoDB Atlas ({db_name})...")
        # SSL Resiliency: Forzar ignorar validación si el entorno local falla
        client = MongoClient(
            mongo_uri, 
            serverSelectionTimeoutMS=5000, 
            tlsAllowInvalidCertificates=True,
            tlsCAFile=None
        )
        db = client[db_name]
        
        # Lista Maestra de Colecciones
        ecosystem = [
            'usuarios', 'eventos', 'analytics', 'merchandise', 
            'tickets', 'payments', 'agent_intelligence', 
            'user_behavior_logs', 'ml_predictions', 'nosql_vault_metadata'
        ]

        existing = db.list_collection_names()
        
        for coll_name in ecosystem:
            if coll_name not in existing:
                print(f"[+] Creando colección: {coll_name}...")
                coll = db[coll_name]
                # Insertar documento de inicialización (Metadata Root)
                init_doc = {
                    "system_init": True,
                    "collection": coll_name,
                    "created_at": datetime.now().isoformat(),
                    "description": f"Colección base del ecosistema NoSQL de Laika Club: {coll_name}",
                    "version": "2.0 (Expansion LIA)"
                }
                coll.insert_one(init_doc)
                print(f"    [OK] Inicializada con éxito.")
            else:
                print(f"[~] La colección '{coll_name}' ya existe. (Saltando)")

        print("\n" + "="*55)
        print("  🎉 ECOSISTEMA INICIALIZADO CON ÉXITO EN LA NUBE 🎉")
        print("  Ya puedes ver las 10 colecciones en MongoDB Compass.")
        print("="*55)

    except Exception as e:
        print(f"[❌] Error crítico: {e}")

if __name__ == "__main__":
    main()
