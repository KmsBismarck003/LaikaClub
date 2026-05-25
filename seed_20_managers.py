import os
import sqlite3
import pymysql
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# List of 20 managers to create
MANAGERS = [
    {"first_name": "Juan", "last_name": "García", "email": "gestor1@laikaclub.com", "phone": "5551112201"},
    {"first_name": "María", "last_name": "Rodríguez", "email": "gestor2@laikaclub.com", "phone": "5551112202"},
    {"first_name": "Carlos", "last_name": "González", "email": "gestor3@laikaclub.com", "phone": "5551112203"},
    {"first_name": "Ana", "last_name": "Fernández", "email": "gestor4@laikaclub.com", "phone": "5551112204"},
    {"first_name": "Luis", "last_name": "López", "email": "gestor5@laikaclub.com", "phone": "5551112205"},
    {"first_name": "Laura", "last_name": "Martínez", "email": "gestor6@laikaclub.com", "phone": "5551112206"},
    {"first_name": "Pedro", "last_name": "Sánchez", "email": "gestor7@laikaclub.com", "phone": "5551112207"},
    {"first_name": "Sofía", "last_name": "Pérez", "email": "gestor8@laikaclub.com", "phone": "5551112208"},
    {"first_name": "Miguel", "last_name": "Gómez", "email": "gestor9@laikaclub.com", "phone": "5551112209"},
    {"first_name": "Lucía", "last_name": "Martin", "email": "gestor10@laikaclub.com", "phone": "5551112210"},
    {"first_name": "José", "last_name": "Jiménez", "email": "gestor11@laikaclub.com", "phone": "5551112211"},
    {"first_name": "Elena", "last_name": "Ruiz", "email": "gestor12@laikaclub.com", "phone": "5551112212"},
    {"first_name": "David", "last_name": "Hernández", "email": "gestor13@laikaclub.com", "phone": "5551112213"},
    {"first_name": "Carmen", "last_name": "Díaz", "email": "gestor14@laikaclub.com", "phone": "5551112214"},
    {"first_name": "Diego", "last_name": "Moreno", "email": "gestor15@laikaclub.com", "phone": "5551112215"},
    {"first_name": "Isabel", "last_name": "Muñoz", "email": "gestor16@laikaclub.com", "phone": "5551112216"},
    {"first_name": "Javier", "last_name": "Álvarez", "email": "gestor17@laikaclub.com", "phone": "5551112217"},
    {"first_name": "Patricia", "last_name": "Romero", "email": "gestor18@laikaclub.com", "phone": "5551112218"},
    {"first_name": "Fernando", "last_name": "Alonso", "email": "gestor19@laikaclub.com", "phone": "5551112219"},
    {"first_name": "Adriana", "last_name": "Gutiérrez", "email": "gestor20@laikaclub.com", "phone": "5551112220"}
]

# Precomputed bcrypt hash for 'gestor123'
BCRYPT_HASH = "$2b$12$QCFpcclJFq49X7vwBnWdbeCcXwXYQSM7QPgWxD9TobHEFwk.eNRU2"

def seed_sqlite():
    auth_db_path = "microservices/auth/auth.db"
    events_db_path = "microservices/events/events.db"
    
    if not os.path.exists(auth_db_path) or not os.path.exists(events_db_path):
        print("[SQLite] Warning: SQLite databases not found. Skipping SQLite seeding.")
        return

    print("\n--- Seeding SQLite Database ---")
    
    # 1. Connect to Auth DB and create managers
    conn_auth = sqlite3.connect(auth_db_path)
    cur_auth = conn_auth.cursor()
    
    try:
        # Clean up existing gestor accounts
        emails_tuple = tuple(m["email"] for m in MANAGERS)
        cur_auth.execute(f"DELETE FROM users WHERE email IN {emails_tuple}")
        conn_auth.commit()
        
        gestor_ids = []
        created_at_str = datetime.now().isoformat()
        
        for m in MANAGERS:
            cur_auth.execute("""
                INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'gestor', 'active', ?)
            """, (m["first_name"], m["last_name"], m["email"], m["phone"], BCRYPT_HASH, created_at_str))
            gestor_ids.append(cur_auth.lastrowid)
            
        conn_auth.commit()
        print(f"[SQLite] Created {len(gestor_ids)} gestores in auth.db")
    except Exception as e:
        conn_auth.rollback()
        print(f"[SQLite] Error seeding auth.db: {e}")
        conn_auth.close()
        return
    finally:
        conn_auth.close()
        
    # 2. Connect to Events DB and assign venues/events
    conn_events = sqlite3.connect(events_db_path)
    cur_events = conn_events.cursor()
    
    try:
        # Prevent JOIN errors in SQLite by ensuring a shadow 'users' table exists in events.db
        cur_events.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                password_hash TEXT,
                role TEXT,
                status TEXT
            )
        """)
        
        # Populate events.db's shadow users table with the gestores
        cur_events.execute(f"DELETE FROM users WHERE email IN {emails_tuple}")
        for gid, m in zip(gestor_ids, MANAGERS):
            cur_events.execute("""
                INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, status)
                VALUES (?, ?, ?, ?, ?, ?, 'gestor', 'active')
            """, (gid, m["first_name"], m["last_name"], m["email"], m["phone"], BCRYPT_HASH))
            
        # Reset assigned manager IDs to clean the state
        cur_events.execute("UPDATE venues SET assigned_manager_id = NULL")
        cur_events.execute("UPDATE events SET assigned_manager_id = NULL")
        conn_events.commit()
        
        # Fetch all venues
        cur_events.execute("SELECT id, name FROM venues WHERE status = 'active'")
        venues = cur_events.fetchall()
        print(f"[SQLite] Found {len(venues)} active venues to distribute.")
        
        assigned_venues_count = 0
        assigned_events_count = 0
        
        # Assign venues round-robin
        for idx, (venue_id, venue_name) in enumerate(venues):
            gestor_id = gestor_ids[idx % len(gestor_ids)]
            
            # Update venue assignment
            cur_events.execute("UPDATE venues SET assigned_manager_id = ? WHERE id = ?", (gestor_id, venue_id))
            assigned_venues_count += 1
            
            # Update associated events in events table
            cur_events.execute("""
                UPDATE events 
                SET assigned_manager_id = ? 
                WHERE venue_id = ? OR (venue = ? AND (venue_id IS NULL OR venue_id = 0))
            """, (gestor_id, venue_id, venue_name))
            
            # Get how many events were updated for this venue
            cur_events.execute("SELECT changes()")
            assigned_events_count += cur_events.fetchone()[0]
            
        conn_events.commit()
        print(f"[SQLite] Seeding complete! Assigned {assigned_venues_count} venues and {assigned_events_count} events among {len(gestor_ids)} gestores.")
    except Exception as e:
        conn_events.rollback()
        print(f"[SQLite] Error seeding events.db: {e}")
    finally:
        conn_events.close()

def seed_mysql():
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")

    print("\n--- Seeding MySQL Database ---")
    conn = None
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password="root" if not password else password,
            database=database,
            charset="utf8mb4"
        )
    except Exception as e:
        print(f"[MySQL] Connection with empty password failed: {e}. Trying fallback password 'root'...")
        try:
            conn = pymysql.connect(
                host=host,
                user=user,
                password="root",
                database=database,
                charset="utf8mb4"
            )
        except Exception as ex:
            print(f"[MySQL] Failed connection fallback: {ex}")
            return

    cur = conn.cursor()
    
    try:
        # Clean up existing gestores
        emails_tuple = tuple(m["email"] for m in MANAGERS)
        cur.execute(f"DELETE FROM users WHERE email IN {pymysql.converters.escape_item(emails_tuple, 'utf8')}")
        conn.commit()
        
        # Insert gestores
        gestor_ids = []
        for m in MANAGERS:
            cur.execute("""
                INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status)
                VALUES (%s, %s, %s, %s, %s, 'gestor', 'active')
            """, (m["first_name"], m["last_name"], m["email"], m["phone"], BCRYPT_HASH))
            cur.execute("SELECT LAST_INSERT_ID()")
            gestor_ids.append(cur.fetchone()[0])
            
        conn.commit()
        print(f"[MySQL] Created {len(gestor_ids)} gestores in users table.")
        
        # Reset assigned manager IDs
        cur.execute("UPDATE venues SET assigned_manager_id = NULL")
        cur.execute("UPDATE events SET assigned_manager_id = NULL")
        conn.commit()
        
        # Fetch all venues
        cur.execute("SELECT id, name FROM venues WHERE status = 'active'")
        venues = cur.fetchall()
        print(f"[MySQL] Found {len(venues)} active venues to distribute.")
        
        assigned_venues_count = 0
        assigned_events_count = 0
        
        # Assign venues round-robin
        for idx, (venue_id, venue_name) in enumerate(venues):
            gestor_id = gestor_ids[idx % len(gestor_ids)]
            
            # Update venue
            cur.execute("UPDATE venues SET assigned_manager_id = %s WHERE id = %s", (gestor_id, venue_id))
            assigned_venues_count += 1
            
            # Update associated events in events table
            cur.execute("""
                UPDATE events 
                SET assigned_manager_id = %s 
                WHERE venue_id = %s OR (venue = %s AND (venue_id IS NULL OR venue_id = 0))
            """, (gestor_id, venue_id, venue_name))
            assigned_events_count += cur.rowcount
            
        conn.commit()
        print(f"[MySQL] Seeding complete! Assigned {assigned_venues_count} venues and {assigned_events_count} events among {len(gestor_ids)} gestores.")
    except Exception as e:
        conn.rollback()
        print(f"[MySQL] Error seeding database: {e}")
        import traceback; traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_sqlite()
    seed_mysql()
