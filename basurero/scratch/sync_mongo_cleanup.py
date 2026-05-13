import pymysql
import pymongo
import os
from dotenv import load_dotenv

def sync_mongo_cleanup():
    load_dotenv()
    
    # 1. Connect to MySQL to get "Keep" lists
    mysql_conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club'),
        cursorclass=pymysql.cursors.DictCursor
    )
    mysql_cursor = mysql_conn.cursor()
    
    print("[MONGO_CLEANUP] Fetching users to keep from MySQL...")
    mysql_cursor.execute("SELECT email, id FROM users") # Assuming MySQL has already been pruned or we take the limit
    keep_users = mysql_cursor.fetchall()
    keep_emails = [u['email'] for u in keep_users]
    keep_mysql_ids = [u['id'] for u in keep_users]
    
    print("[MONGO_CLEANUP] Fetching events to keep from MySQL...")
    mysql_cursor.execute("SELECT id FROM events")
    keep_event_ids = [str(e['id']) for e in mysql_cursor.fetchall()]
    
    mysql_conn.close()
    
    # 2. Connect to MongoDB
    mongo_client = pymongo.MongoClient(os.getenv('MONGO_URI'), tlsAllowInvalidCertificates=True)
    db = mongo_client[os.getenv('MONGO_DB', 'laika_analytics')]
    
    # 3. Prune MongoDB Collections
    print(f"[MONGO_CLEANUP] Pruning 'usuarios' to match {len(keep_emails)} records...")
    res = db.usuarios.delete_many({"email": {"$nin": keep_emails}})
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} users from MongoDB.")
    
    print(f"[MONGO_CLEANUP] Pruning 'eventos' to match {len(keep_event_ids)} records...")
    # MongoDB might store event IDs as numbers or strings depending on injection
    # We'll check both
    res = db.eventos.delete_many({
        "$and": [
            {"id": {"$nin": [int(i) for i in keep_event_ids]}},
            {"id": {"$nin": keep_event_ids}}
        ]
    })
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} events from MongoDB.")
    
    print("[MONGO_CLEANUP] Pruning 'tickets' and 'payments'...")
    # Tickets usually link to event_id or user_email
    res = db.tickets.delete_many({
        "$or": [
            {"user_email": {"$nin": keep_emails}},
            {"event_id": {"$nin": [int(i) for i in keep_event_ids] + keep_event_ids}}
        ]
    })
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} tickets from MongoDB.")
    
    res = db.payments.delete_many({"user_email": {"$nin": keep_emails}})
    print(f"[MONGO_CLEANUP] Deleted {res.deleted_count} payments from MongoDB.")

    # 4. Final summary
    print(f"[MONGO_CLEANUP] MongoDB is now synchronized with pruned MySQL.")
    mongo_client.close()

if __name__ == "__main__":
    sync_mongo_cleanup()
