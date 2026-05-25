import os
import sqlite3
import pymysql
import random
import unicodedata
from dotenv import load_dotenv

load_dotenv()

def strip_accents(text):
    if not text:
        return ""
    # Normalize unicode to separate characters and combining accents, then filter out the accents
    normalized = unicodedata.normalize('NFD', text)
    return "".join(c for c in normalized if unicodedata.category(c) != 'Mn')

def generate_venues_data():
    db_path = "microservices/events/events.db"
    if not os.path.exists(db_path):
        print(f"[Generator] SQLite Database not found at {db_path} to fetch municipalities.")
        return []
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Select ~70 municipalities spread across different states
    cur.execute("""
        SELECT m.id, m.name, s.name 
        FROM municipalities m 
        JOIN states s ON m.state_id = s.id 
        WHERE m.id % 35 = 1 
        LIMIT 75
    """)
    rows = cur.fetchall()
    conn.close()
    
    venue_types = ["Auditorio Municipal", "Teatro Principal", "Centro Cultural", "Cine Diana", "Foro Acustico", "Complejo Cultural", "Estadio Municipal", "Arena de Espectaculos", "Cinepolis Alternativo"]
    streets = ["Av Juarez", "Calle Hidalgo", "Blvd Morelos", "Av Reforma", "Calle Zaragoza", "Av Constitucion", "Av 16 de Septiembre", "Calle Madero"]
    
    venues = []
    
    for row in rows:
        m_id, m_name, s_name = row
        clean_mun = strip_accents(m_name)
        clean_state = strip_accents(s_name)
        
        # Select random venue type
        v_type = random.choice(venue_types)
        venue_name = f"{v_type} {clean_mun}"
        
        # Address
        address = f"{random.choice(streets)} {random.randint(10, 999)}, Col Centro, {clean_mun}"
        
        # Rooms
        num_rooms = random.randint(2, 4)
        rooms = []
        total_capacity = 0
        for i in range(1, num_rooms + 1):
            r_type = "Sala" if i < num_rooms else "Area"
            r_name = f"{r_type} {i}"
            r_cap = random.choice([100, 200, 300, 500, 800, 1000, 1500, 2000])
            rooms.append({"name": r_name, "capacity": r_cap})
            total_capacity += r_cap
            
        venues.append({
            "name": venue_name,
            "city": clean_mun,
            "address": address,
            "map_url": f"https://maps.app.goo.gl/dummy_{clean_mun.lower().replace(' ', '_')}",
            "capacity": total_capacity,
            "municipality_id": m_id,
            "rooms": rooms
        })
        
    return venues

def seed_sqlite(venues):
    db_path = "microservices/events/events.db"
    if not os.path.exists(db_path):
        print(f"[SQLite] Database not found at {db_path}")
        return
    print(f"Connecting to SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        inserted_venues = 0
        inserted_rooms = 0
        for venue in venues:
            # Check if already exists to avoid duplicates
            cur.execute("SELECT id FROM venues WHERE name = ?", (venue["name"],))
            existing = cur.fetchone()
            if existing:
                continue

            # Insert Venue
            cur.execute("""
                INSERT INTO venues (name, city, address, map_url, capacity, status, municipality_id)
                VALUES (?, ?, ?, ?, ?, 'active', ?)
            """, (venue["name"], venue["city"], venue["address"], venue["map_url"], venue["capacity"], venue["municipality_id"]))
            venue_id = cur.lastrowid
            inserted_venues += 1

            # Insert Rooms
            for room in venue["rooms"]:
                cur.execute("""
                    INSERT INTO venue_rooms (venue_id, name, capacity, status, layout_mode, layout_metadata)
                    VALUES (?, ?, ?, 'active', 'general_admission', '{}')
                """, (venue_id, room["name"], room["capacity"]))
                inserted_rooms += 1

        conn.commit()
        print(f"[SQLite] Seeded successfully! Created {inserted_venues} new venues and {inserted_rooms} rooms.")
    except Exception as e:
        conn.rollback()
        print(f"[SQLite] Error: {e}")
    finally:
        conn.close()

def seed_mysql(venues):
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "root")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")

    print(f"Connecting to MySQL: {host} (user: {user}, db: {database})")
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password if password else "root",
            database=database,
            charset="utf8mb4"
        )
    except Exception as e:
        print(f"[MySQL] Connection failed: {e}. Trying with password 'root'...")
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
        inserted_venues = 0
        inserted_rooms = 0
        for venue in venues:
            # Check if already exists to avoid duplicates
            cur.execute("SELECT id FROM venues WHERE name = %s", (venue["name"],))
            existing = cur.fetchone()
            if existing:
                continue

            # Insert Venue
            cur.execute("""
                INSERT INTO venues (name, city, address, map_url, capacity, status, municipality_id)
                VALUES (%s, %s, %s, %s, %s, 'active', %s)
            """, (venue["name"], venue["city"], venue["address"], venue["map_url"], venue["capacity"], venue["municipality_id"]))
            
            # Retrieve last row id
            cur.execute("SELECT LAST_INSERT_ID()")
            venue_id = cur.fetchone()[0]
            inserted_venues += 1

            # Insert Rooms
            for room in venue["rooms"]:
                cur.execute("""
                    INSERT INTO venue_rooms (venue_id, name, capacity, status, layout_mode, layout_metadata)
                    VALUES (%s, %s, %s, 'active', 'general_admission', '{}')
                """, (venue_id, room["name"], room["capacity"]))
                inserted_rooms += 1

        conn.commit()
        print(f"[MySQL] Seeded successfully! Created {inserted_venues} new venues and {inserted_rooms} rooms.")
    except Exception as e:
        conn.rollback()
        print(f"[MySQL] Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    generated_venues = generate_venues_data()
    print(f"Generated {len(generated_venues)} venues programmatically.")
    if generated_venues:
        seed_sqlite(generated_venues)
        seed_mysql(generated_venues)
