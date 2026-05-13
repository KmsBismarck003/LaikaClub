import pymysql
import os
from dotenv import load_dotenv

def find_best_data():
    load_dotenv()
    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club'),
        cursorclass=pymysql.cursors.DictCursor
    )
    cursor = conn.cursor()

    # 1. Top 10k Users (prioritize admins, then users with tickets/payments)
    print("Finding top 10k users...")
    query_users = """
        SELECT u.id, u.email, u.role, COUNT(t.id) as ticket_count 
        FROM users u 
        LEFT JOIN tickets t ON u.id = t.user_id 
        GROUP BY u.id 
        ORDER BY 
            CASE WHEN u.role IN ('admin', 'gestor', 'operador') THEN 0 ELSE 1 END,
            ticket_count DESC 
        LIMIT 10000
    """
    cursor.execute(query_users)
    best_users = cursor.fetchall()
    user_ids = [u['id'] for u in best_users]
    print(f"Total best users identified: {len(user_ids)}")

    # 2. Top 640 Events (prioritize events with tickets)
    print("Finding top 640 events...")
    query_events = """
        SELECT e.id, e.name, COUNT(t.id) as ticket_count 
        FROM events e 
        LEFT JOIN tickets t ON e.id = t.event_id 
        GROUP BY e.id 
        ORDER BY ticket_count DESC 
        LIMIT 640
    """
    cursor.execute(query_events)
    best_events = cursor.fetchall()
    event_ids = [e['id'] for e in best_events]
    print(f"Total best events identified: {len(event_ids)}")

    conn.close()
    return user_ids, event_ids

if __name__ == "__main__":
    find_best_data()
