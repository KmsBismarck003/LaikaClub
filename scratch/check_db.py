
import sqlite3
import os

DB_PATH = "microservices/events/events.db"

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print("--- VENUES ---")
    cur.execute("SELECT id, name, city FROM venues")
    venues = cur.fetchall()
    for v in venues:
        print(v)

    print("\n--- ROOMS ---")
    cur.execute("SELECT id, venue_id, name FROM venue_rooms")
    rooms = cur.fetchall()
    for r in rooms:
        print(r)

    print("\n--- EVENTS COLUMNS ---")
    cur.execute("PRAGMA table_info(events)")
    cols = [col[1] for col in cur.fetchall()]
    print(cols)

    conn.close()

if __name__ == "__main__":
    check_db()
