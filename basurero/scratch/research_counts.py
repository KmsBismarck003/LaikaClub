import pymysql
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def check_mysql():
    print("--- MySQL Counts ---")
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "laika_club"),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = [t[list(t.keys())[0]] for t in cursor.fetchall()]
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                res = cursor.fetchone()
                print(f"Table '{table}': {res['count']}")
            
            # Synthetic data counts
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE password_hash = 'pbkdf2:sha256:260000$default_pass'")
            res = cursor.fetchone()
            print(f"Synthetic Users: {res['count']}")
            
            cursor.execute("SELECT COUNT(*) as count FROM events WHERE description LIKE 'Evento sintetico%'")
            res = cursor.fetchone()
            print(f"Synthetic Events: {res['count']}")
            
            cursor.execute("SELECT COUNT(*) as count FROM tickets WHERE event_id IN (SELECT id FROM events WHERE description LIKE 'Evento sintetico%')")
            res = cursor.fetchone()
            print(f"Synthetic Tickets: {res['count']}")
        conn.close()
    except Exception as e:
        print(f"MySQL Error: {e}")

def check_mongo():
    print("\n--- MongoDB Counts ---")
    try:
        client = MongoClient(os.getenv("MONGO_URI"))
        db = client[os.getenv("MONGO_DB", "laika_analytics")]
        collections = db.list_collection_names()
        for coll in collections:
            count = db[coll].count_documents({})
            if count > 0:
                print(f"Collection '{coll}': {count}")
        client.close()
    except Exception as e:
        print(f"MongoDB Error: {e}")

if __name__ == "__main__":
    check_mysql()
    check_mongo()
