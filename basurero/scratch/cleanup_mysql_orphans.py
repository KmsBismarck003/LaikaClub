import os
import sys

# MySQL Data Directory for Laika Club
DB_PATH = r"C:\xampp\mysql\data\laika_club"

CORRUPTED_TABLES = [
    "achievements", "event_functions", "manager_action_logs", "payments", 
    "refund_logs", "request_logs", "request_logs_backup_1770878583", 
    "reviews", "system_logs", "test_ping", "tickets", 
    "user_achievements", "user_coupons", "venues"
]

def cleanup():
    print(f"[*] Starting cleanup of orphaned .ibd files in {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"[❌] Error: Path {DB_PATH} not found.")
        return

    deleted_count = 0
    for table in CORRUPTED_TABLES:
        ibd_file = os.path.join(DB_PATH, f"{table}.ibd")
        if os.path.exists(ibd_file):
            try:
                os.remove(ibd_file)
                print(f"[OK] Removed: {table}.ibd")
                deleted_count += 1
            except Exception as e:
                print(f"[ERROR] Failed to remove {table}.ibd: {e}")
        else:
            print(f"[INFO] {table}.ibd not found (already clean).")
            
    print(f"\n[DONE] Removed {deleted_count} orphaned files.")

if __name__ == "__main__":
    cleanup()
