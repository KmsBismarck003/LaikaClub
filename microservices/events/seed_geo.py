import os
import json
import sqlite3
import pymysql
from dotenv import load_dotenv

load_dotenv()

# Map of JSON state keys to database target properties
STATE_MAPPING = {
    "Aguascalientes": {"id": 1, "code": "AS", "name": "Aguascalientes"},
    "Baja California": {"id": 2, "code": "BC", "name": "Baja California"},
    "Baja California Sur": {"id": 3, "code": "BS", "name": "Baja California Sur"},
    "Campeche": {"id": 4, "code": "CC", "name": "Campeche"},
    "Chiapas": {"id": 5, "code": "CS", "name": "Chiapas"},
    "Chihuahua": {"id": 6, "code": "CH", "name": "Chihuahua"},
    "Ciudad de México": {"id": 7, "code": "DF", "name": "Ciudad de México"},
    "Coahuila de Zaragoza": {"id": 8, "code": "CL", "name": "Coahuila"},
    "Colima": {"id": 9, "code": "CM", "name": "Colima"},
    "Durango": {"id": 10, "code": "DG", "name": "Durango"},
    "Guanajuato": {"id": 11, "code": "GT", "name": "Guanajuato"},
    "Guerrero": {"id": 12, "code": "GR", "name": "Guerrero"},
    "Hidalgo": {"id": 13, "code": "HG", "name": "Hidalgo"},
    "Jalisco": {"id": 14, "code": "JC", "name": "Jalisco"},
    "México": {"id": 15, "code": "MC", "name": "Estado de México"},
    "Michoacán de Ocampo": {"id": 16, "code": "MN", "name": "Michoacán"},
    "Morelos": {"id": 17, "code": "MS", "name": "Morelos"},
    "Nayarit": {"id": 18, "code": "NT", "name": "Nayarit"},
    "Nuevo León": {"id": 19, "code": "NL", "name": "Nuevo León"},
    "Oaxaca": {"id": 20, "code": "OC", "name": "Oaxaca"},
    "Puebla": {"id": 21, "code": "PL", "name": "Puebla"},
    "Querétaro": {"id": 22, "code": "QT", "name": "Querétaro"},
    "Quintana Roo": {"id": 23, "code": "QR", "name": "Quintana Roo"},
    "San Luis Potosí": {"id": 24, "code": "SP", "name": "San Luis Potosí"},
    "Sinaloa": {"id": 25, "code": "SL", "name": "Sinaloa"},
    "Sonora": {"id": 26, "code": "SR", "name": "Sonora"},
    "Tabasco": {"id": 27, "code": "TC", "name": "Tabasco"},
    "Tamaulipas": {"id": 28, "code": "TS", "name": "Tamaulipas"},
    "Tlaxcala": {"id": 29, "code": "TL", "name": "Tlaxcala"},
    "Veracruz de Ignacio de la Llave": {"id": 30, "code": "VZ", "name": "Veracruz"},
    "Yucatán": {"id": 31, "code": "YN", "name": "Yucatán"},
    "Zacatecas": {"id": 32, "code": "ZS", "name": "Zacatecas"}
}

# Helper to normalize strings for matching
def normalize(s):
    if not s:
        return ""
    # Remove accents and decode/clean weird characters
    s = s.strip()
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u',
        'ñ': 'n', 'Ñ': 'n',
        '': 'e' # Commonly 'é' or 'í' or 'ó' in the broken DB strings
    }
    # Hand-written replacement for common broken characters
    s_lower = s.lower()
    for k, v in replacements.items():
        s_lower = s_lower.replace(k, v)
    return s_lower

def seed_sqlite(json_data):
    db_path = "microservices/events/events.db"
    if not os.path.exists(db_path):
        print(f"[SQLite] Database file not found at {db_path}")
        return
        
    print(f"\nSeeding SQLite Database ({db_path})...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    try:
        # 1. Fetch current venues to preserve municipality assignments
        cur.execute("""
            SELECT v.id, v.name, m.name, s.name 
            FROM venues v
            LEFT JOIN municipalities m ON v.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
        """)
        old_venues = cur.fetchall()
        print(f"[SQLite] Found {len(old_venues)} existing venues to preserve mapping:")
        for v in old_venues:
            print(f"  Venue: '{v[1]}' currently mapped to: '{v[2]}' ({v[3]})")
            
        # 2. Disable foreign key checks
        cur.execute("PRAGMA foreign_keys = OFF")
        
        # 3. Truncate tables
        cur.execute("DELETE FROM municipalities")
        cur.execute("DELETE FROM states")
        cur.execute("DELETE FROM countries")
        
        # 4. Insert Mexico
        cur.execute("INSERT INTO countries (id, name, code) VALUES (1, 'México', 'MX')")
        
        # 5. Insert States & Municipalities
        municipality_mapping = {} # (state_id, normalized_mun_name) -> new_id
        mun_counter = 1
        
        for state_key, state_props in STATE_MAPPING.items():
            state_id = state_props["id"]
            state_code = state_props["code"]
            state_name = state_props["name"]
            
            # Insert State
            cur.execute(
                "INSERT INTO states (id, country_id, name, code) VALUES (?, 1, ?, ?)",
                (state_id, state_name, state_code)
            )
            
            # Insert Municipalities for this state
            municipalities = json_data.get(state_key, [])
            for m_name in municipalities:
                cur.execute(
                    "INSERT INTO municipalities (id, state_id, name) VALUES (?, ?, ?)",
                    (mun_counter, state_id, m_name)
                )
                norm_key = (state_id, normalize(m_name))
                municipality_mapping[norm_key] = mun_counter
                mun_counter += 1
                
        print(f"[SQLite] Inserted 32 states and {mun_counter - 1} municipalities.")
        
        # 6. Re-map venues
        for v_id, v_name, old_m_name, old_s_name in old_venues:
            if not old_m_name or not old_s_name:
                continue
                
            # Find the state ID
            matched_state_id = None
            norm_old_state = normalize(old_s_name)
            for state_key, state_props in STATE_MAPPING.items():
                if norm_old_state in normalize(state_props["name"]) or normalize(state_props["name"]) in norm_old_state:
                    matched_state_id = state_props["id"]
                    break
                    
            if not matched_state_id:
                # Special cases
                if "mexico" in norm_old_state:
                    if "ciudad" in norm_old_state or "df" in norm_old_state:
                        matched_state_id = 7
                    else:
                        matched_state_id = 15
                elif "leon" in norm_old_state:
                    matched_state_id = 19
                elif "jalisco" in norm_old_state:
                    matched_state_id = 14
                    
            if matched_state_id:
                norm_old_mun = normalize(old_m_name)
                # Find matching municipality
                new_mun_id = None
                # Try exact normalized match
                new_mun_id = municipality_mapping.get((matched_state_id, norm_old_mun))
                
                # If not found, try partial match
                if not new_mun_id:
                    for (s_id, m_name_norm), m_id in municipality_mapping.items():
                        if s_id == matched_state_id and (norm_old_mun in m_name_norm or m_name_norm in norm_old_mun):
                            new_mun_id = m_id
                            break
                            
                if new_mun_id:
                    cur.execute(
                        "UPDATE venues SET municipality_id = ? WHERE id = ?",
                        (new_mun_id, v_id)
                    )
                    print(f"  [SQLite] Re-mapped venue '{v_name}' to new municipality ID {new_mun_id}")
                else:
                    print(f"  [SQLite] WARNING: Could not find new municipality ID for '{old_m_name}' in state {matched_state_id}")
            else:
                print(f"  [SQLite] WARNING: Could not map state '{old_s_name}' for venue '{v_name}'")
                
        # 7. Re-enable foreign key checks and commit
        cur.execute("PRAGMA foreign_keys = ON")
        conn.commit()
        print("[SQLite] Seeding completed successfully.")
        
    except Exception as e:
        conn.rollback()
        print(f"[SQLite] Error during seeding: {e}")
        import traceback; traceback.print_exc()
    finally:
        conn.close()

def seed_mysql(json_data):
    print("\nSeeding MySQL Database (laika_club3_v2)...")
    
    MYSQL_USER = os.getenv('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD') or 'root'
    MYSQL_HOST = os.getenv('MYSQL_HOST') or 'localhost'
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE') or 'laika_club3_v2'
    
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            charset='utf8mb4',
            connect_timeout=3
        )
        cur = conn.cursor()
    except Exception as e:
        print(f"[MySQL] Connection failed: {e}. Skipping MySQL seeding.")
        return
        
    try:
        # 1. Fetch current venues to preserve municipality assignments
        cur.execute("""
            SELECT v.id, v.name, m.name, s.name 
            FROM venues v
            LEFT JOIN municipalities m ON v.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
        """)
        old_venues = cur.fetchall()
        print(f"[MySQL] Found {len(old_venues)} existing venues to preserve mapping:")
        for v in old_venues:
            print(f"  Venue: '{v[1]}' currently mapped to: '{v[2]}' ({v[3]})")
            
        # 2. Disable foreign key checks
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # 3. Truncate tables
        cur.execute("TRUNCATE TABLE municipalities")
        cur.execute("TRUNCATE TABLE states")
        cur.execute("TRUNCATE TABLE countries")
        
        # 4. Insert Mexico
        cur.execute("INSERT INTO countries (id, name, code) VALUES (1, 'México', 'MX')")
        
        # 5. Insert States & Municipalities
        municipality_mapping = {} # (state_id, normalized_mun_name) -> new_id
        mun_counter = 1
        
        for state_key, state_props in STATE_MAPPING.items():
            state_id = state_props["id"]
            state_code = state_props["code"]
            state_name = state_props["name"]
            
            # Insert State
            cur.execute(
                "INSERT INTO states (id, country_id, name, code) VALUES (%s, 1, %s, %s)",
                (state_id, state_name, state_code)
            )
            
            # Insert Municipalities for this state
            municipalities = json_data.get(state_key, [])
            for m_name in municipalities:
                cur.execute(
                    "INSERT INTO municipalities (id, state_id, name) VALUES (%s, %s, %s)",
                    (mun_counter, state_id, m_name)
                )
                norm_key = (state_id, normalize(m_name))
                municipality_mapping[norm_key] = mun_counter
                mun_counter += 1
                
        print(f"[MySQL] Inserted 32 states and {mun_counter - 1} municipalities.")
        
        # 6. Re-map venues
        for v_id, v_name, old_m_name, old_s_name in old_venues:
            if not old_m_name or not old_s_name:
                continue
                
            # Find the state ID
            matched_state_id = None
            norm_old_state = normalize(old_s_name)
            for state_key, state_props in STATE_MAPPING.items():
                if norm_old_state in normalize(state_props["name"]) or normalize(state_props["name"]) in norm_old_state:
                    matched_state_id = state_props["id"]
                    break
                    
            if not matched_state_id:
                # Special cases
                if "mexico" in norm_old_state:
                    if "ciudad" in norm_old_state or "df" in norm_old_state:
                        matched_state_id = 7
                    else:
                        matched_state_id = 15
                elif "leon" in norm_old_state:
                    matched_state_id = 19
                elif "jalisco" in norm_old_state:
                    matched_state_id = 14
                    
            if matched_state_id:
                norm_old_mun = normalize(old_m_name)
                # Find matching municipality
                new_mun_id = None
                # Try exact normalized match
                new_mun_id = municipality_mapping.get((matched_state_id, norm_old_mun))
                
                # If not found, try partial match
                if not new_mun_id:
                    for (s_id, m_name_norm), m_id in municipality_mapping.items():
                        if s_id == matched_state_id and (norm_old_mun in m_name_norm or m_name_norm in norm_old_mun):
                            new_mun_id = m_id
                            break
                            
                if new_mun_id:
                    cur.execute(
                        "UPDATE venues SET municipality_id = %s WHERE id = %s",
                        (new_mun_id, v_id)
                    )
                    print(f"  [MySQL] Re-mapped venue '{v_name}' to new municipality ID {new_mun_id}")
                else:
                    print(f"  [MySQL] WARNING: Could not find new municipality ID for '{old_m_name}' in state {matched_state_id}")
            else:
                print(f"  [MySQL] WARNING: Could not map state '{old_s_name}' for venue '{v_name}'")
                
        # 7. Re-enable foreign key checks and commit
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()
        print("[MySQL] Seeding completed successfully.")
        
    except Exception as e:
        conn.rollback()
        print(f"[MySQL] Error during seeding: {e}")
        import traceback; traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    json_file_path = "microservices/events/mexico-estados-municipios.json"
    if not os.path.exists(json_file_path):
        print(f"Error: JSON file not found at {json_file_path}")
        exit(1)
        
    with open(json_file_path, "r", encoding="utf-8") as f:
        json_data = json.load(f)
        
    seed_sqlite(json_data)
    seed_mysql(json_data)
