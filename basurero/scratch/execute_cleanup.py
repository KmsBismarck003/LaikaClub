import pymysql
import os
from dotenv import load_dotenv
import time

def execute_cleanup():
    load_dotenv()
    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    cursor = conn.cursor()

    # 1. IDENTIFY IDs TO KEEP
    print("[CLEANUP] Identifying top 10,000 users...")
    query_users = """
        SELECT u.id FROM users u 
        LEFT JOIN tickets t ON u.id = t.user_id 
        GROUP BY u.id 
        ORDER BY 
            CASE WHEN u.role IN ('admin', 'gestor', 'operador') THEN 0 ELSE 1 END,
            COUNT(t.id) DESC 
        LIMIT 10000
    """
    cursor.execute(query_users)
    keep_user_ids = [row['id'] for row in cursor.fetchall()]
    print(f"[CLEANUP] Found {len(keep_user_ids)} users to keep.")

    print("[CLEANUP] Identifying top 640 events...")
    query_events = """
        SELECT e.id FROM events e 
        LEFT JOIN tickets t ON e.id = t.event_id 
        GROUP BY e.id 
        ORDER BY COUNT(t.id) DESC 
        LIMIT 640
    """
    cursor.execute(query_events)
    keep_event_ids = [row['id'] for row in cursor.fetchall()]
    print(f"[CLEANUP] Found {len(keep_event_ids)} events to keep.")

    # 2. BATCH DELETE TICKETS
    # We delete tickets that DON'T belong to the kept users OR the kept events
    print("[CLEANUP] Starting batch deletion of tickets...")
    batch_size = 50000
    total_deleted_tickets = 0
    
    # We use a temporary table or a complex "NOT IN" with a huge list is slow.
    # Better: Identify IDs of tickets to DELETE.
    # Actually, it's easier to delete by chunks of ID ranges.
    
    cursor.execute("SELECT MIN(id) as min_id, MAX(id) as max_id FROM tickets")
    res = cursor.fetchone()
    min_id, max_id = res['min_id'], res['max_id']
    
    if min_id and max_id:
        for i in range(min_id, max_id + 1, batch_size):
            upper = i + batch_size - 1
            # Delete tickets in range [i, upper] that are NOT in keep lists
            # Since keep_user_ids is 10k, we can use it in IN.
            # But keep_event_ids is 640, also fine.
            sql = f"""
                DELETE FROM tickets 
                WHERE id BETWEEN {i} AND {upper}
                AND (user_id NOT IN ({','.join(map(str, keep_user_ids))})
                OR event_id NOT IN ({','.join(map(str, keep_event_ids))}))
            """
            cursor.execute(sql)
            affected = cursor.rowcount
            total_deleted_tickets += affected
            print(f"[CLEANUP] Processed ticket range {i}-{upper}. Deleted {affected} tickets. Total: {total_deleted_tickets}")
            time.sleep(0.1)

    # 3. DELETE OTHER TABLES (Cascading handles some, but let's be thorough)
    print("[CLEANUP] Cleaning other tables...")
    
    # Events
    cursor.execute(f"DELETE FROM event_ticket_sections WHERE event_id NOT IN ({','.join(map(str, keep_event_ids))})")
    print(f"[CLEANUP] Deleted orphaned ticket sections.")
    
    cursor.execute(f"DELETE FROM events WHERE id NOT IN ({','.join(map(str, keep_event_ids))})")
    print(f"[CLEANUP] Reduced events table to 640 records.")

    # Users
    cursor.execute(f"DELETE FROM payments WHERE user_id NOT IN ({','.join(map(str, keep_user_ids))})")
    cursor.execute(f"DELETE FROM user_achievements WHERE user_id NOT IN ({','.join(map(str, keep_user_ids))})")
    cursor.execute(f"DELETE FROM users WHERE id NOT IN ({','.join(map(str, keep_user_ids))})")
    print(f"[CLEANUP] Reduced users table to 10,000 records.")

    # 4. TRUNCATE LOGS
    print("[CLEANUP] Truncating log tables...")
    cursor.execute("TRUNCATE TABLE request_logs")
    cursor.execute("TRUNCATE TABLE audit_logs")
    cursor.execute("TRUNCATE TABLE system_logs")
    
    print("[CLEANUP] SQL cleanup completed successfully.")
    conn.close()

if __name__ == "__main__":
    execute_cleanup()
