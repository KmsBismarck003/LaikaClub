import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

TABLES = [
    "achievements", "ad_clicks", "ads", "audit_logs", "auth_logs", 
    "backup_history", "event_functions", "event_rules", 
    "event_ticket_sections", "events", "manager_action_logs", 
    "merchandise_items", "merchandise_order_items", "merchandise_orders", 
    "merchandise_settings", "merchandise_variants", "payments", 
    "permission_requests", "refund_logs", "request_logs", 
    "request_logs_backup_1770878583", "reviews", "system_config", 
    "system_logs", "test_ping", "tickets", "user_achievements", 
    "user_coupons", "users", "venues"
]

def deep_clean():
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "laika_club")
    )
    conn.autocommit(True)
    with conn.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        for table in TABLES:
            print(f"[*] Processing {table}...")
            # Attempt 1: Just drop it
            try:
                cursor.execute(f"DROP TABLE IF EXISTS `{table}`")
            except:
                pass
            
            # Attempt 2: Recreate and discard if it's orphaned in InnoDB
            try:
                cursor.execute(f"CREATE TABLE `{table}` (id INT) ENGINE=InnoDB")
                cursor.execute(f"ALTER TABLE `{table}` DISCARD TABLESPACE")
                cursor.execute(f"DROP TABLE `{table}`")
                print(f"  [OK] Forcibly purged {table}")
            except Exception as e:
                print(f"  [INFO] {table} purge status: {e}")
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    conn.close()

if __name__ == "__main__":
    deep_clean()
