import pymysql
import os
from sqlalchemy import create_engine, text

# Get MySQL config from env
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "laika_club")

def migrate_mysql():
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            connect_timeout=2
        )
        cur = conn.cursor()
        print(f"Connected to MySQL at {MYSQL_HOST}")
        
        # Check columns
        cur.execute("SHOW COLUMNS FROM merchandise_items")
        columns = [row[0] for row in cur.fetchall()]
        
        if 'category' not in columns:
            print("Adding 'category' to MySQL...")
            cur.execute("ALTER TABLE merchandise_items ADD COLUMN category VARCHAR(100)")
        
        if 'is_official' not in columns:
            print("Adding 'is_official' to MySQL...")
            cur.execute("ALTER TABLE merchandise_items ADD COLUMN is_official BOOLEAN DEFAULT 1")
            
        if 'rating' not in columns:
            print("Adding 'rating' to MySQL...")
            cur.execute("ALTER TABLE merchandise_items ADD COLUMN rating FLOAT DEFAULT 4.5")
            
        conn.commit()
        conn.close()
        print("MySQL migration successful.")
    except Exception as e:
        print(f"MySQL Migration failed: {e}")

if __name__ == "__main__":
    migrate_mysql()
