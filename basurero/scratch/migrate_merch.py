import sqlite3
import os

db_path = 'microservices/merchandise/merchandise.db'

if not os.path.exists(db_path):
    print(f"Error: Database {db_path} not found.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check if columns already exist
    cur.execute("PRAGMA table_info(merchandise_items)")
    columns = [row[1] for row in cur.fetchall()]
    
    if 'category' not in columns:
        print("Adding 'category' column...")
        cur.execute("ALTER TABLE merchandise_items ADD COLUMN category VARCHAR(100)")
    
    if 'is_official' not in columns:
        print("Adding 'is_official' column...")
        cur.execute("ALTER TABLE merchandise_items ADD COLUMN is_official BOOLEAN DEFAULT 1")
        
    if 'rating' not in columns:
        print("Adding 'rating' column...")
        cur.execute("ALTER TABLE merchandise_items ADD COLUMN rating FLOAT DEFAULT 4.5")
    
    conn.commit()
    print("Database migration successful.")
    conn.close()
except Exception as e:
    print(f"Migration failed: {e}")
