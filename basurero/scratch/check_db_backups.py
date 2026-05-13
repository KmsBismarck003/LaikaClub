import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def check():
    print("--- Database Diagnostics ---")
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            # Check backup_history
            cursor.execute("SHOW TABLES LIKE 'backup_history'")
            exists = cursor.fetchone()
            print(f"Table 'backup_history' exists: {exists is not None}")
            
            if exists:
                cursor.execute("SELECT COUNT(*) as count FROM backup_history")
                count = cursor.fetchone()['count']
                print(f"Records in 'backup_history': {count}")
                
                cursor.execute("SELECT * FROM backup_history ORDER BY created_at DESC LIMIT 5")
                rows = cursor.fetchall()
                for row in rows:
                    print(f"  - {row['backup_id']} | {row['type']} | {row['status']}")
            else:
                print("Creating table 'backup_history'...")
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
                conn.commit()
                print("Table 'backup_history' created successfully.")

        conn.close()
    except Exception as e:
        print(f"MySQL Error: {e}")

if __name__ == "__main__":
    check()
