import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

CORRUPTED_TABLES = [
    "achievements", "event_functions", "manager_action_logs", "payments", 
    "refund_logs", "request_logs", "request_logs_backup_1770878583", 
    "reviews", "system_logs", "test_ping", "tickets", 
    "user_achievements", "user_coupons", "venues"
]

def drop_tables():
    print("[*] Connecting to MySQL to drop corrupted tables...")
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "laika_club")
        )
        with conn.cursor() as cursor:
            for table in CORRUPTED_TABLES:
                print(f"[*] Dropping {table}...")
                try:
                    cursor.execute(f"DROP TABLE IF EXISTS {table}")
                except Exception as e:
                    print(f"  [!] Error dropping {table}: {e}")
        conn.commit()
        conn.close()
        print("[DONE] Tables dropped.")
    except Exception as e:
        print(f"[❌] MySQL connection error: {e}")

if __name__ == "__main__":
    drop_tables()
