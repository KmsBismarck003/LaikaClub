
import pymysql
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import date, timedelta
import random

load_dotenv()

# MySQL configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'laika_club'),
    'cursorclass': pymysql.cursors.DictCursor
}

SQLITE_DB_PATH = Path("microservices/events/events.db")

EVENTS_DATA = [
    ("Concierto de Rock: Los Jaguares", "Una noche épica de rock nacional.", "concert", 1200, "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"),
    ("Gran Maratón Laika 2026", "Corre por una buena causa.", "sport", 450, "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"),
    ("El Fantasma de la Ópera", "La obra clásica de Broadway.", "theater", 950, "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800"),
    ("Festival Gastronómico", "Prueba lo mejor de la cocina local.", "festival", 250, "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"),
    ("Torneo de E-Sports", "Los mejores pro-players del país.", "other", 300, "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"),
    ("Jazz Under the Stars", "Noche de jazz suave al aire libre.", "concert", 800, "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800"),
    ("Exhibición de Arte Digital", "Explora el futuro del arte.", "other", 150, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800"),
    ("Clásico del Fútbol", "El derbi más esperado del año.", "sport", 1500, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800"),
    ("Circo del Sol: Luzia", "Un viaje maravilloso a través de México.", "theater", 1800, "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"),
    ("Feria del Libro 2026", "Encuentra tu próxima gran historia.", "festival", 50, "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"),
    ("Concierto Sinfónico: Star Wars", "La música de John Williams en vivo.", "concert", 700, "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800"),
    ("Noche de Stand-up Comedy", "Ríe con los mejores comediantes.", "theater", 400, "https://images.unsplash.com/photo-1560439514-4e9645009904?w=800")
]

# MAIN ADS (8)
MAIN_ADS = [
    ("⚡ OFERTA RELÁMPAGO: 50% OFF", "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200", "/", "main"),
    ("✨ MEMBRESÍA PREMIUM CLUB LAIKA", "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200", "/register", "main"),
    ("🎫 BOLETOS PARA JAGUARES YA", "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200", "/events/1", "main"),
    ("🎭 TEMPORADA DE TEATRO 2026", "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200", "/category/theater", "main"),
    ("🏃 INSCRÍBETE AL MARATÓN", "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200", "/events/2", "main"),
    ("🍔 FESTIVAL GASTRONÓMICO", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", "/events/4", "main"),
    ("🎮 TORNEO GAMER: REGÍSTRATE", "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200", "/events/5", "main"),
    ("🎷 JAZZ NIGHTS: RESERVA", "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200", "/events/6", "main")
]

# SIDE LEFT ADS (8)
SIDE_LEFT_ADS = [
    ("💎 Membresía Diamante", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", "/register", "side_left"),
    ("🎸 Tour Rock 2026", "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400", "/events", "side_left"),
    ("🏟️ Palcos Exclusivos", "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400", "/events", "side_left"),
    ("🍷 Cata de Vinos VIP", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400", "/events", "side_left"),
    ("🎫 Preventa Banamex", "https://images.unsplash.com/photo-1556742044-3c52d6e881ee?w=400", "/events", "side_left"),
    ("🎤 Noche de Karaoke", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400", "/events", "side_left"),
    ("🥨 Snacks & Drinks", "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400", "/shop", "side_left"),
    ("🛋️ Lounge VIP Access", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400", "/register", "side_left")
]

# SIDE RIGHT ADS (8)
SIDE_RIGHT_ADS = [
    ("🛍️ Tienda de Merch", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400", "/shop", "side_right"),
    ("⚽ Próximo Clásico", "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400", "/events", "side_right"),
    ("🎭 Clase de Teatro", "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400", "/events", "side_right"),
    ("🧘 Yoga en el Parque", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400", "/events", "side_right"),
    ("🎁 Regala una Gift Card", "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400", "/shop", "side_right"),
    ("🧴 Cuidado de Mascotas", "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400", "/shop", "side_right"),
    ("📦 Envíos Gratis", "https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=400", "/shop", "side_right"),
    ("⭐ Califica tu Experiencia", "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=400", "/", "side_right")
]

ADS_DATA = MAIN_ADS + SIDE_LEFT_ADS + SIDE_RIGHT_ADS

TICKET_SECTIONS = [
    {"name": "VIP PREMIUM", "price_mult": 2.5, "capacity": 50, "color": "#FFD700", "badge": "EXPERIENCIA EXCLUSIVA"},
    {"name": "PREFERENTE", "price_mult": 1.5, "capacity": 150, "color": "#C0C0C0", "badge": "MEJOR VISTA"},
    {"name": "GENERAL", "price_mult": 1.0, "capacity": 500, "color": "#CD7F32", "badge": "MÁS VENDIDO"}
]

RULES_DATA = [
    ("No se permiten cámaras", "CameraOff"),
    ("Prohibido fumar", "SmokingForbidden"),
    ("Acceso permitido a menores", "UserCheck")
]

VENUES = ["Auditorio Nacional, CDMX", "Estadio Azteca, CDMX", "Teatro Degollado, GDL", "Parque Fundidora, MTY"]

def restore_mysql():
    print("--- Restoring MySQL ---")
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        with conn.cursor() as cursor:
            tables = ["events", "event_ticket_sections", "event_rules", "ads", "system_config"]
            for table in tables:
                print(f"Repairing {table}...")
                cursor.execute(f"DROP TABLE IF EXISTS {table}")
            
            # Create Tables
            cursor.execute("""
                CREATE TABLE events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    event_date DATE,
                    event_time TIME,
                    location VARCHAR(255),
                    venue VARCHAR(255),
                    category VARCHAR(100),
                    price DECIMAL(10, 2),
                    total_tickets INT,
                    available_tickets INT,
                    image_url TEXT,
                    status VARCHAR(50) DEFAULT 'draft',
                    created_by INT,
                    grid_position_x INT DEFAULT 0,
                    grid_position_y INT DEFAULT 0,
                    grid_span_x INT DEFAULT 1,
                    grid_span_y INT DEFAULT 1,
                    grid_page INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            cursor.execute("""
                CREATE TABLE event_ticket_sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    capacity INT NOT NULL,
                    available INT NOT NULL,
                    badge_text VARCHAR(100),
                    color_hex VARCHAR(10),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
                CREATE TABLE event_rules (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    icon VARCHAR(50) NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
                CREATE TABLE ads (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    image_url TEXT NOT NULL,
                    link_url TEXT,
                    position VARCHAR(50) DEFAULT 'main',
                    active TINYINT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
                CREATE TABLE system_config (
                    `key` VARCHAR(100) PRIMARY KEY,
                    `value` TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            configs = [
                ("maintenanceMode", "false"),
                ("registrationEnabled", "true"),
                ("sessionTimeout", "30"),
                ("maxTicketsPerUser", "5"),
                ("news_ticker_config", '{"text": "PROXIMOS EVENTOS - OFERTAS EXCLUSIVAS - CLUB LAIKA", "backgroundColor": "#000000", "textColor": "#ffffff", "speed": 20}')
            ]
            for k, v in configs:
                cursor.execute("INSERT INTO system_config (`key`, `value`) VALUES (%s, %s)", (k, v))

            event_id = 1
            for name, desc, cat, price, img in EVENTS_DATA:
                ev_date = (date.today() + timedelta(days=random.randint(5, 90)))
                cursor.execute("""
                    INSERT INTO events (id, name, description, event_date, event_time, location, venue, category, price, total_tickets, available_tickets, image_url, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (event_id, name, desc, ev_date, "19:30:00", random.choice(VENUES), "Recinto Demo", cat, float(price), 700, 650, img, "published"))
                
                for sec in TICKET_SECTIONS:
                    s_price = float(price) * sec["price_mult"]
                    cursor.execute("""
                        INSERT INTO event_ticket_sections (event_id, name, price, capacity, available, badge_text, color_hex)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (event_id, sec["name"], s_price, sec["capacity"], sec["capacity"]-10, sec["badge"], sec["color"]))
                
                for r_title, r_icon in RULES_DATA:
                    cursor.execute("""
                        INSERT INTO event_rules (event_id, title, icon, description)
                        VALUES (%s, %s, %s, %s)
                    """, (event_id, r_title, r_icon, "Regla de seguridad estándar."))
                
                event_id += 1
            
            for title, img, link, pos in ADS_DATA:
                cursor.execute("""
                    INSERT INTO ads (title, image_url, link_url, position, active)
                    VALUES (%s, %s, %s, %s, %s)
                """, (title, img, link, pos, 1))

            print(f"MySQL Restored: 12 Events, {len(ADS_DATA)} Ads total.")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"MySQL Error: {e}")

def restore_sqlite():
    print("\n--- Restoring SQLite ---")
    try:
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        
        tables = ["events", "event_ticket_sections", "event_rules", "ads", "system_config"]
        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
        
        cursor.execute("""
            CREATE TABLE events (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                event_date TEXT,
                event_time TEXT,
                location TEXT,
                venue TEXT,
                category TEXT,
                price REAL,
                total_tickets INTEGER,
                available_tickets INTEGER,
                image_url TEXT,
                status TEXT DEFAULT 'draft',
                created_by INTEGER,
                grid_position_x INTEGER DEFAULT 0,
                grid_position_y INTEGER DEFAULT 0,
                grid_span_x INTEGER DEFAULT 1,
                grid_span_y INTEGER DEFAULT 1,
                grid_page INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE event_ticket_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                capacity INTEGER NOT NULL,
                available INTEGER NOT NULL,
                badge_text TEXT,
                color_hex TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE event_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                icon TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE ads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                link_url TEXT,
                position TEXT DEFAULT 'main',
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE system_config (
                `key` TEXT PRIMARY KEY,
                `value` TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        configs = [
            ("maintenanceMode", "false"),
            ("registrationEnabled", "true"),
            ("sessionTimeout", "30"),
            ("maxTicketsPerUser", "5"),
            ("news_ticker_config", '{"text": "PROXIMOS EVENTOS - OFERTAS EXCLUSIVAS - CLUB LAIKA", "backgroundColor": "#000000", "textColor": "#ffffff", "speed": 20}')
        ]
        for k, v in configs:
            cursor.execute("INSERT INTO system_config (`key`, `value`) VALUES (?, ?)", (k, v))

        event_id = 1
        for name, desc, cat, price, img in EVENTS_DATA:
            ev_date = (date.today() + timedelta(days=random.randint(5, 90))).isoformat()
            cursor.execute("""
                INSERT INTO events (id, name, description, event_date, event_time, location, venue, category, price, total_tickets, available_tickets, image_url, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (event_id, name, desc, ev_date, "19:30", random.choice(VENUES), "Recinto Demo", cat, float(price), 700, 650, img, "published"))
            
            for sec in TICKET_SECTIONS:
                s_price = float(price) * sec["price_mult"]
                cursor.execute("""
                    INSERT INTO event_ticket_sections (event_id, name, price, capacity, available, badge_text, color_hex)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (event_id, sec["name"], s_price, sec["capacity"], sec["capacity"]-10, sec["badge"], sec["color"]))
            
            for r_title, r_icon in RULES_DATA:
                cursor.execute("""
                    INSERT INTO event_rules (event_id, title, icon, description)
                    VALUES (?, ?, ?, ?)
                """, (event_id, r_title, r_icon, "Regla de seguridad estándar."))
            
            event_id += 1
        
        for title, img, link, pos in ADS_DATA:
            cursor.execute("""
                INSERT INTO ads (title, image_url, link_url, position, active)
                VALUES (?, ?, ?, ?, ?)
            """, (title, img, link, pos, 1))
            
        print(f"SQLite Restored: 12 Events, {len(ADS_DATA)} Ads total.")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQLite Error: {e}")

if __name__ == "__main__":
    restore_mysql()
    restore_sqlite()
