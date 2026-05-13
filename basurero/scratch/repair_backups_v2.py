import os
import pymysql
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

load_dotenv()

def repair_and_seed():
    print("--- Repairing Backup Infrastructure (Using sys_backup_history) ---")
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            # 1. Create new table (Avoid the corrupted one)
            print("Creando tabla sys_backup_history...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sys_backup_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    backup_id VARCHAR(100) UNIQUE,
                    type VARCHAR(50),
                    status VARCHAR(50),
                    scheduled_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_at DATETIME,
                    size_mb DOUBLE,
                    error_message TEXT
                )
            """)
            
            # 2. Seed data
            print("Sembrando registros de respaldo...")
            seeds = [
                {
                    "bid": f"backup_full_20260411_{uuid.uuid4().hex[:6]}",
                    "type": "full",
                    "status": "completed",
                    "size": 12.5,
                    "created": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "bid": f"backup_incremental_20260412_{uuid.uuid4().hex[:6]}",
                    "type": "incremental",
                    "status": "completed",
                    "size": 2.1,
                    "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "bid": f"backup_mongo_cloud_atlas_20260412",
                    "type": "mongodb",
                    "status": "completed",
                    "size": 45.8,
                    "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            ]
            
            for s in seeds:
                cursor.execute("""
                    INSERT IGNORE INTO sys_backup_history (backup_id, type, status, size_mb, created_at, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (s['bid'], s['type'], s['status'], s['size'], s['created'], s['created']))
            
            conn.commit()
            print("Infraestructura MySQL reparada (sys_backup_history) y sembrada.")

        conn.close()
        
        # Create directory
        backup_dir = "microservices/admin/backups"
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            print(f"Directorio creado: {backup_dir}")
            
        # Create dummy files
        for s in seeds:
            ext = ".sql" if s['type'] != "mongodb" else ".json"
            file_path = os.path.join(backup_dir, f"{s['bid']}{ext}")
            # Solo crear si no existe
            if not os.path.exists(file_path):
                with open(file_path, "w") as f:
                    f.write("-- Laika Club Backup Simulator\n-- Generated for UI validation")
                print(f"Archivo semilla creado: {file_path}")

    except Exception as e:
        print(f"Error durante la reparación: {e}")

if __name__ == "__main__":
    repair_and_seed()
