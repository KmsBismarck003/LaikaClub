import pymysql
import pymongo
import os
from dotenv import load_dotenv

def sync_mongo_cleanup():
    load_dotenv()
    
    # 1. Connect to MySQL to identify the SAME "Keep" lists
    mysql_conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club'),
        cursorclass=pymysql.cursors.DictCursor
    )
    mysql_cursor = mysql_conn.cursor()
    
    print("[MONGO_CLEANUP] Identifying top 10,000 users from MySQL...")
    query_users = """
        SELECT u.email FROM users u 
        LEFT JOIN tickets t ON u.id = t.user_id 
        GROUP BY u.id 
        ORDER BY 
            CASE WHEN u.role IN ('admin', 'gestor', 'operador') THEN 0 ELSE 1 END,
            COUNT(t.id) DESC 
        LIMIT 10000
    """
    mysql_cursor.execute(query_users)
    keep_emails = [u['email'] for u in mysql_cursor.fetchall()]
    
    print("[MONGO_CLEANUP] Identifying top 640 events from MySQL...")
    query_events = """
        SELECT e.id FROM events e 
        LEFT JOIN tickets t ON e.id = t.event_id 
        GROUP BY e.id 
        ORDER BY COUNT(t.id) DESC 
        LIMIT 640
    """
    mysql_cursor.execute(query_events)
    keep_event_ids = [str(e['id']) for e in mysql_cursor.fetchall()]
    
    mysql_conn.close()
    
    # 2. Connect to MongoDB Atlas
    mongo_client = pymongo.MongoClient(os.getenv('MONGO_URI'), tlsAllowInvalidCertificates=True)
    db = mongo_client[os.getenv('MONGO_DB', 'laika_analytics')]
    
    # 3. Prune MongoDB Collections
    print(f"[MONGO_CLEANUP] Pruning 'usuarios' in Atlas to top 10k...")
    res = db.usuarios.delete_many({"email": {"$nin": keep_emails}})
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} users from Atlas.")
    
    print(f"[MONGO_CLEANUP] Pruning 'eventos' in Atlas to top 640...")
    res = db.eventos.delete_many({
        "$and": [
            {"id": {"$nin": [int(i) for i in keep_event_ids]}},
            {"id": {"$nin": keep_event_ids}}
        ]
    })
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} events from Atlas.")
    
    print("[MONGO_CLEANUP] Pruning 'tickets' and 'payments' in Atlas...")
    # Clean tickets not matching kept users/events
    res = db.tickets.delete_many({
        "$or": [
            {"user_email": {"$nin": keep_emails}},
            {"event_id": {"$nin": [int(i) for i in keep_event_ids] + keep_event_ids}}
        ]
    })
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} tickets from Atlas.")
    
    res = db.payments.delete_many({"user_email": {"$nin": keep_emails}})
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} payments from Atlas.")

    print("[MONGO_CLEANUP] MongoDB Atlas cleanup completed.")
    mongo_client.close()

if __name__ == "__main__":
    sync_mongo_cleanup()
