
import pymysql
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    print("--- Checking MySQL ---")
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT status, COUNT(*) as count FROM events GROUP BY status")
            results = cursor.fetchall()
            print(f"Total events in MySQL by status: {results}")
            
            cursor.execute("SELECT id, name, status FROM events LIMIT 5")
            samples = cursor.fetchall()
            print(f"Sample events: {samples}")
        
        conn.close()
    except Exception as e:
        print(f"MySQL Error: {e}")

def check_sqlite():
    print("\n--- Checking SQLite ---")
    db_path = Path("microservices/events/events.db")
    if not db_path.exists():
        print(f"SQLite DB not found at {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT status, COUNT(*) as count FROM events GROUP BY status")
        results = [dict(row) for row in cursor.fetchall()]
        print(f"Total events in SQLite by status: {results}")
        
        cursor.execute("SELECT id, name, status FROM events LIMIT 5")
        samples = [dict(row) for row in cursor.fetchall()]
        print(f"Sample events: {samples}")
        
        conn.close()
    except Exception as e:
        print(f"SQLite Error: {e}")

if __name__ == "__main__":
    check_mysql()
    check_sqlite()
