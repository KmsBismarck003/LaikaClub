import os
import pymysql
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

load_dotenv()

def repair_and_seed():
    print("--- Repairing Backup Infrastructure ---")
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            # 1. Drop corrupt table
            print("Eliminando tabla corrupta si existe...")
            cursor.execute("DROP TABLE IF EXISTS backup_history")
            
            # 2. Recreate table
            print("Recreando tabla backup_history...")
            cursor.execute("""
                CREATE TABLE backup_history (
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
            
            # 3. Seed data
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
                    INSERT INTO backup_history (backup_id, type, status, size_mb, created_at, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (s['bid'], s['type'], s['status'], s['size'], s['created'], s['created']))
            
            conn.commit()
            print("Infraestructura MySQL reparada y sembrada.")

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
            with open(file_path, "w") as f:
                f.write("-- Laika Club Backup Simulator\n-- Generated for UI validation")
            print(f"Archivo semilla creado: {file_path}")

    except Exception as e:
        print(f"Error durante la reparación: {e}")

if __name__ == "__main__":
    repair_and_seed()
