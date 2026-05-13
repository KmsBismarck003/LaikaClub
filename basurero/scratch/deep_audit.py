import os
import pymysql
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

def get_mysql_conn():
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "laika_club"),
        cursorclass=pymysql.cursors.DictCursor
    )

def deep_audit():
    print("=== LAIKA CLUB DEEP DATABASE AUDIT ===\n")
    
    # 1. MySQL Health
    try:
        conn = get_mysql_conn()
        with conn.cursor() as cursor:
            # Check all tables
            cursor.execute("SHOW TABLES")
            tables = [list(t.values())[0] for t in cursor.fetchall()]
            print(f"[SQL] Found {len(tables)} tables.")
            
            corrupted_tables = []
            empty_tables = []
            valid_tables = []
            
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                    count = cursor.fetchone()['count']
                    if count == 0:
                        empty_tables.append(table)
                    valid_tables.append(table)
                except pymysql.err.InternalError as e:
                    if e.args[0] == 1932:
                        corrupted_tables.append(table)
                    else:
                        print(f"[!] Other error for {table}: {e}")
                except Exception as e:
                    print(f"[!] Generic error for {table}: {e}")
            
            if corrupted_tables:
                print(f"\n[❌] Found {len(corrupted_tables)} CORRUPTED tables (Engine error 1932):")
                print(f"    {', '.join(corrupted_tables)}")
            
            if empty_tables:
                print(f"\n[!] Found {len(empty_tables)} empty tables:")
                print(f"    {', '.join(empty_tables)}")
            
            # Check Events Status in valid tables
            if 'events' in valid_tables:
                cursor.execute("SELECT status, COUNT(*) as count FROM events GROUP BY status")
                statuses = cursor.fetchall()
                print(f"\n[SQL] Events Breakdown: {statuses}")
                
                cursor.execute("SELECT COUNT(*) as count FROM events WHERE status='draft'")
                draft_count = cursor.fetchone()['count']
                if draft_count > 0:
                    print(f"  - WARNING: {draft_count} events are in 'draft' and NOT VISIBLE.")
        conn.close()
    except Exception as e:
        print(f"[CRITICAL] MySQL audit failed: {e}")

    # 2. MongoDB Health
    try:
        uri = os.getenv("MONGO_URI", "").strip('"')
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        db = client.laika_analytics
        collections = db.list_collection_names()
        print(f"\n[NOSQL] Found {len(collections)} collections in Atlas.")
        
        for coll in collections:
            count = db[coll].count_documents({})
            print(f"  - {coll}: {count} docs")
            
    except Exception as e:
        print(f"[CRITICAL] MongoDB audit failed: {e}")

if __name__ == "__main__":
    deep_audit()
