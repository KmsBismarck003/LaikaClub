import sqlite3
import os

DB_PATH = "microservices/events/events.db"

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH}")
    # Try alternate path if we are in a different CWD
    DB_PATH = "events.db"

def check_events():
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT id, name, status FROM events")
        rows = cur.fetchall()
        print(f"Found {len(rows)} events:")
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}, Status: {row[2]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_events()
