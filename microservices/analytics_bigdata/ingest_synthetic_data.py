import pandas as pd
import pymysql
import os
import time
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASS = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DATABASE", "laika_club")

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../ejercicios pca_red_neural/data_sintetica")

def ingest_table(csv_name, table_name, column_mapping):
    csv_path = os.path.join(DATA_DIR, csv_name)
    if not os.path.exists(csv_path):
        print(f"[ERROR] No se encontró {csv_path}")
        return

    print(f"[*] Procesando {csv_name} -> {table_name}...")
    df = pd.read_csv(csv_path)
    
    # Manejar NaNs
    df = df.where(pd.notnull(df), None)

    conn = pymysql.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASS, database=MYSQL_DB, charset="utf8mb4")
    cursor = conn.cursor()

    try:
        # Desactivar checks para velocidad
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # Mapear columnas del CSV a la DB
        cols_in_db = list(column_mapping.values())
        cols_in_csv = list(column_mapping.keys())
        
        cols_list = list(column_mapping.values())
        if table_name == "users" and "email" not in cols_list: cols_list.append("email")
        if table_name == "tickets" and "ticket_code" not in cols_list: cols_list.append("ticket_code")
        
        cols_str = ", ".join(cols_list)
        placeholders = ", ".join(["%s"] * len(cols_list))
        sql = f"REPLACE INTO {table_name} ({cols_str}) VALUES ({placeholders})"
        
        data_to_insert = []
        for _, row in df.iterrows():
            vals = [row[col] for col in cols_in_csv]
            # Campos extra para satisfacer constraints únicos
            if table_name == "users":
                if "email" not in column_mapping.values():
                    # Generar email ficticio basado en el id o username
                    email_idx = df.columns.tolist().index("username") if "username" in df.columns else 0
                    vals.append(f"{row.iloc[email_idx]}@laika.com")
            
            if table_name == "tickets":
                if "ticket_code" not in column_mapping.values():
                    # Generar código de ticket único
                    id_idx = df.columns.tolist().index("id") if "id" in df.columns else 0
                    vals.append(f"TKT-{row.iloc[id_idx]}-{int(time.time())}")

            data_to_insert.append(tuple(vals))

        start_time = time.time()
        # Insertar en lotes de 1000 para velocidad
        batch_size = 1000
        for i in range(0, len(data_to_insert), batch_size):
            cursor.executemany(sql, data_to_insert[i:i+batch_size])
            conn.commit() # Commit por lote para ver progreso
            print(f"      - Lote {i} a {min(i+batch_size, len(data_to_insert))} completado...")
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        elapsed = time.time() - start_time
        print(f"   [OK] {len(df)} registros integrados en {elapsed:.2f}s")
    except Exception as e:
        print(f"   [FAIL] Error en {table_name}: {e}")
        conn.rollback()
    finally:
        conn.close()

def run_ingestion():
    # 1. Usuarios
    ingest_table("usuarios_train.csv", "users", {
        "id": "id",
        "username": "username"
    })
    
    # 2. Eventos
    ingest_table("eventos_train.csv", "events", {
        "id": "id",
        "name": "name",
        "fecha": "event_date",
        "categoria": "category",
        "precio_base": "price",
        "tickets_disponibles": "available_tickets"
    })
    
    # 3. Tickets
    ingest_table("tickets_train.csv", "tickets", {
        "id": "id",
        "user_id": "user_id",
        "event_id": "event_id",
        "ticket_type": "ticket_type",
        "price": "price",
        "created_at": "purchase_date"
    })
    
    # 4. Pagos
    ingest_table("pagos_train.csv", "payments", {
        "id": "id",
        "user_id": "user_id",
        "amount": "amount",
        "method": "payment_method",
        "status": "status",
        "timestamp": "payment_date"
    })

if __name__ == "__main__":
    print("=== INICIANDO INGESTIÓN DE BIG DATA (100k) ===")
    run_ingestion()
    print("=== PROCESO COMPLETADO ===")
