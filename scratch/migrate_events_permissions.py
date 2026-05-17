import os
import sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "microservices/events/events.db"

def migrate_sqlite():
    if not os.path.exists(DB_PATH):
        print(f"SQLite DB not found at {DB_PATH}")
        return
    
    print(f"Migrating SQLite DB at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Add columns to events
    cols_to_add = [
        ("ads_enabled", "INTEGER DEFAULT 0"),
        ("max_ads", "INTEGER DEFAULT 5"),
        ("merch_enabled", "INTEGER DEFAULT 0"),
        ("metrics_enabled", "INTEGER DEFAULT 0"),
        ("assigned_manager_id", "INTEGER"),
        ("municipality_id", "INTEGER"),
        ("room_id", "INTEGER"),
        ("venue_id", "INTEGER"),
        ("use_seating_map", "INTEGER DEFAULT 0")
    ]
    
    cur.execute("PRAGMA table_info(events)")
    existing_cols = [row[1] for row in cur.fetchall()]
    
    for col, type_def in cols_to_add:
        if col not in existing_cols:
            print(f"Adding column {col} to events...")
            cur.execute(f"ALTER TABLE events ADD COLUMN {col} {type_def}")
            
    # Add columns to venues
    cur.execute("PRAGMA table_info(venues)")
    existing_venue_cols = [row[1] for row in cur.fetchall()]
    if "assigned_manager_id" not in existing_venue_cols:
        print("Adding column assigned_manager_id to venues...")
        # Note: Venues might not exist in SQLite if using MySQL, but init_events_db creates it?
        # Actually init_events_db doesn't create venues. venues_controller uses raw SQL.
        # Let's check if venues table exists in SQLite
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='venues'")
        if cur.fetchone():
            cur.execute("ALTER TABLE venues ADD COLUMN assigned_manager_id INTEGER")

    conn.commit()
    conn.close()
    print("SQLite Migration complete.")

def migrate_mysql():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
    
    try:
        engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")
        with engine.connect() as conn:
            print(f"Migrating MySQL DB {dbname}...")
            
            # Events table
            cols_events = {
                "ads_enabled": "TINYINT(1) DEFAULT 0",
                "max_ads": "INT DEFAULT 5",
                "merch_enabled": "TINYINT(1) DEFAULT 0",
                "metrics_enabled": "TINYINT(1) DEFAULT 0",
                "assigned_manager_id": "INT",
                "municipality_id": "INT",
                "room_id": "INT",
                "venue_id": "INT",
                "use_seating_map": "TINYINT(1) DEFAULT 0"
            }
            
            res = conn.execute(text("SHOW COLUMNS FROM events"))
            existing = [row[0] for row in res.fetchall()]
            
            for col, type_def in cols_events.items():
                if col not in existing:
                    print(f"Adding column {col} to events...")
                    conn.execute(text(f"ALTER TABLE events ADD COLUMN {col} {type_def}"))
            
            # Venues table
            res = conn.execute(text("SHOW COLUMNS FROM venues"))
            existing_venue = [row[0] for row in res.fetchall()]
            if "assigned_manager_id" not in existing_venue:
                print("Adding column assigned_manager_id to venues...")
                conn.execute(text("ALTER TABLE venues ADD COLUMN assigned_manager_id INT"))
            
            conn.commit()
            print("MySQL Migration complete.")
    except Exception as e:
        print(f"MySQL Migration failed: {e}")

if __name__ == "__main__":
    migrate_sqlite()
    migrate_mysql()
