import sqlite3
import os

DB_PATH = "microservices/tickets/tickets.db"

def init():
    if not os.path.exists(DB_PATH):
        print("DB non existent")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Check for purchase_date in tickets
    cur.execute("PRAGMA table_info(tickets)")
    cols = [c[1] for c in cur.fetchall()]
    if "purchase_date" not in cols:
        print("Adding purchase_date to tickets...")
        cur.execute("ALTER TABLE tickets ADD COLUMN purchase_date TIMESTAMP")

    print("Ensuring refund_requests table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS refund_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ticket_id INTEGER NOT NULL,
            event_id INTEGER,
            amount REAL NOT NULL,
            reason TEXT NOT NULL,
            detail TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    init()
