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

    # 2. CREATE TEMPORARY TABLES FOR PERFORMANCE
    print("[CLEANUP] Creating temporary tables for IDs to keep...")
    cursor.execute("CREATE TEMPORARY TABLE IF NOT EXISTS tmp_keep_users (id INT PRIMARY KEY)")
    cursor.execute("CREATE TEMPORARY TABLE IF NOT EXISTS tmp_keep_events (id INT PRIMARY KEY)")
    
    # Bulk insert into temp tables
    cursor.executemany("INSERT IGNORE INTO tmp_keep_users (id) VALUES (%s)", [(uid,) for uid in keep_user_ids])
    cursor.executemany("INSERT IGNORE INTO tmp_keep_events (id) VALUES (%s)", [(eid,) for eid in keep_event_ids])
    print("[CLEANUP] Temp tables populated.")

    # 3. BATCH DELETE TICKETS
    print("[CLEANUP] Starting optimized batch deletion of tickets...")
    batch_size = 100000
    total_deleted_tickets = 0
    
    cursor.execute("SELECT MIN(id) as min_id, MAX(id) as max_id FROM tickets")
    res = cursor.fetchone()
    min_id, max_id = res['min_id'], res['max_id']
    
    if min_id and max_id:
        for i in range(min_id, max_id + 1, batch_size):
            upper = i + batch_size - 1
            # Delete tickets in range [i, upper] that are NOT associated with kept users/events
            # Using LEFT JOIN is usually faster than NOT IN with large list
            sql = f"""
                DELETE t FROM tickets t
                LEFT JOIN tmp_keep_users ku ON t.user_id = ku.id
                LEFT JOIN tmp_keep_events ke ON t.event_id = ke.id
                WHERE t.id BETWEEN {i} AND {upper}
                AND (ku.id IS NULL OR ke.id IS NULL)
            """
            cursor.execute(sql)
            affected = cursor.rowcount
            total_deleted_tickets += affected
            print(f"[CLEANUP] Processed ticket range {i}-{upper}. Deleted {affected} tickets. Total: {total_deleted_tickets}")
            # No sleep needed for optimized query unless load is a concern

    # 4. DELETE OTHER TABLES
    print("[CLEANUP] Pruning users and events...")
    
    # We must use real temp tables if we want to refer to them in multiple queries across same connection
    # Actually, TEMPORARY tables disappear on close.
    
    # Delete Events
    cursor.execute("DELETE FROM event_ticket_sections WHERE event_id NOT IN (SELECT id FROM tmp_keep_events)")
    cursor.execute("DELETE FROM events WHERE id NOT IN (SELECT id FROM tmp_keep_events)")
    
    # Delete Users
    cursor.execute("DELETE FROM payments WHERE user_id NOT IN (SELECT id FROM tmp_keep_users)")
    cursor.execute("DELETE FROM user_achievements WHERE user_id NOT IN (SELECT id FROM tmp_keep_users)")
    cursor.execute("DELETE FROM users WHERE id NOT IN (SELECT id FROM tmp_keep_users)")
    
    # 5. TRUNCATE LOGS
    print("[CLEANUP] Truncating log tables...")
    cursor.execute("TRUNCATE TABLE request_logs")
    cursor.execute("TRUNCATE TABLE audit_logs")
    cursor.execute("TRUNCATE TABLE system_logs")
    
    print("[CLEANUP] Optimized cleanup completed.")
    conn.close()

if __name__ == "__main__":
    execute_cleanup()
