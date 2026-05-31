from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "microservices/events/events.db"

# ============================================
# PROTOCOLO DE AUTORECUPERACIÓN (FALLBACK)
# ============================================
def init_events_db():
    """Verifica si la base de datos existe, si no, la crea (Fallback Protocol)"""
    if not os.path.exists(DB_PATH):
        print("[FALLBACK] Events DB no encontrada. Recreando...")
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        cur.execute("""
            CREATE TABLE IF NOT EXISTS event_ticket_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                capacity INTEGER NOT NULL,
                available INTEGER NOT NULL,
                badge_text TEXT,
                color_hex TEXT,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS event_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                icon TEXT NOT NULL,
                description TEXT NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS event_functions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                venue_id INTEGER NOT NULL,
                room_id INTEGER,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS ads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                link_url TEXT,
                position TEXT DEFAULT 'main',
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS system_config (
                `key` TEXT PRIMARY KEY,
                `value` TEXT
            )
        """)

        # --- VENUES INFRASTRUCTURE ---
        cur.execute("""
            CREATE TABLE IF NOT EXISTS venues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT,
                address TEXT NOT NULL,
                map_url TEXT,
                capacity INTEGER,
                image_url TEXT,
                status TEXT DEFAULT 'active',
                assigned_manager_id INTEGER,
                municipality_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS venue_rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venue_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                capacity INTEGER,
                status TEXT DEFAULT 'active',
                layout_mode TEXT DEFAULT 'map',
                layout_metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS seating_zones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                color_hex TEXT DEFAULT '#cccccc',
                geometry_json TEXT,
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS seating_blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                name TEXT,
                x_position REAL NOT NULL,
                y_position REAL NOT NULL,
                rotation REAL DEFAULT 0,
                config TEXT,
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS room_seats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                block_id INTEGER,
                zone_id INTEGER,
                seat_type_id INTEGER NOT NULL,
                seat_label TEXT NOT NULL,
                x_position REAL NOT NULL,
                y_position REAL NOT NULL,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)

        # --- GEO TABLES ---
        cur.execute("CREATE TABLE IF NOT EXISTS countries (id INTEGER PRIMARY KEY, name TEXT, code TEXT)")
        cur.execute("CREATE TABLE IF NOT EXISTS states (id INTEGER PRIMARY KEY, country_id INTEGER, name TEXT, code TEXT)")
        cur.execute("CREATE TABLE IF NOT EXISTS municipalities (id INTEGER PRIMARY KEY, state_id INTEGER, name TEXT)")

        # Configuración por defecto al recrear
        configs = [
            ("maintenanceMode", "false"),
            ("registrationEnabled", "true"),
            ("sessionTimeout", "30"),
            ("maxTicketsPerUser", "5"),
            ("news_ticker_config", '{"text": "PROXIMOS EVENTOS - OFERTAS EXCLUSIVAS - CLUB LAIKA", "backgroundColor": "#000000", "textColor": "#ffffff", "speed": 20}')
        ]
        for k, v in configs:
            cur.execute("INSERT OR IGNORE INTO system_config (`key`, `value`) VALUES (?, ?)", (k, v))

        conn.commit()
        conn.close()
        print("[FALLBACK] Events DB inicializada con éxito.")
    else:
        # MIGRACIÓN: Verificar columnas de grid_span y grid_page si faltan
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(events)")
        existing_columns = [col[1] for col in cursor.fetchall()]

        needed_columns = {
            "grid_span_x": "INTEGER DEFAULT 1",
            "grid_span_y": "INTEGER DEFAULT 1",
            "grid_page": "INTEGER DEFAULT 0",
        }

        migration_done = False
        for col_name, col_type in needed_columns.items():
            if col_name not in existing_columns:
                print(f"[PROTOCOL] Events DB: Añadiendo columna {col_name}...")
                cursor.execute(f"ALTER TABLE events ADD COLUMN {col_name} {col_type}")
                migration_done = True

        # MIGRACIÓN: Venues
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='venues'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(venues)")
            venue_columns = [col[1] for col in cursor.fetchall()]
            venue_needed = {
                "assigned_manager_id": "INTEGER",
                "city": "TEXT",
                "municipality_id": "INTEGER"
            }
            for col_name, col_type in venue_needed.items():
                if col_name not in venue_columns:
                    print(f"[PROTOCOL] Events DB: Añadiendo columna {col_name} a venues...")
                    cursor.execute(f"ALTER TABLE venues ADD COLUMN {col_name} {col_type}")
                    migration_done = True
        else:
            # Recrear tabla venues si no existe
            print("[PROTOCOL] Events DB: Creando tabla venues...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS venues (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    city TEXT,
                    address TEXT NOT NULL,
                    map_url TEXT,
                    capacity INTEGER,
                    image_url TEXT,
                    status TEXT DEFAULT 'active',
                    assigned_manager_id INTEGER,
                    municipality_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            migration_done = True

        # Asegurar tablas secundarias
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS venue_rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venue_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                capacity INTEGER,
                status TEXT DEFAULT 'active',
                layout_mode TEXT DEFAULT 'map',
                layout_metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS seating_zones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                color_hex TEXT DEFAULT '#cccccc',
                geometry_json TEXT,
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS seating_blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                name TEXT,
                x_position REAL NOT NULL,
                y_position REAL NOT NULL,
                rotation REAL DEFAULT 0,
                config TEXT,
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_functions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                venue_id INTEGER NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS room_seats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                block_id INTEGER,
                zone_id INTEGER,
                seat_type_id INTEGER NOT NULL,
                seat_label TEXT NOT NULL,
                x_position REAL NOT NULL,
                y_position REAL NOT NULL,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                link_url TEXT,
                position TEXT DEFAULT 'main',
                active INTEGER DEFAULT 1,
                event_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_config (
                `key` TEXT PRIMARY KEY,
                `value` TEXT
            )
        """)
        cursor.execute("CREATE TABLE IF NOT EXISTS countries (id INTEGER PRIMARY KEY, name TEXT, code TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS states (id INTEGER PRIMARY KEY, country_id INTEGER, name TEXT, code TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS municipalities (id INTEGER PRIMARY KEY, state_id INTEGER, name TEXT)")

        if migration_done:
            conn.commit()
            print("[PROTOCOL] Events DB migración completada.")
        else:
            conn.commit()
        conn.close()

Base = declarative_base()

def run_migrations(engine):
    """Ejecuta migraciones de esquema en la base de datos activa (MySQL o SQLite)."""
    from sqlalchemy import text
    with engine.connect() as conn:
        print(f"[PROTOCOL] Verificando esquema en {engine.name}...")
        
        # 1. Asegurar tabla venues y sus columnas
        try:
            # Crear tabla event_functions if not exists
            if engine.name == 'mysql':
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS event_functions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        event_id INT NOT NULL,
                        `date` DATE NOT NULL,
                        `time` TIME NOT NULL,
                        venue_id INT NOT NULL,
                        room_id INT,
                        KEY fk_event_func (event_id)
                    )
                """))
            else:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS event_functions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_id INTEGER NOT NULL,
                        date TEXT NOT NULL,
                        time TEXT NOT NULL,
                        venue_id INTEGER NOT NULL,
                        room_id INTEGER
                    )
                """))
            conn.commit()
            
            # Asegurar que la columna room_id existe si la tabla ya existía
            if engine.name == 'mysql':
                try:
                    conn.execute(text("ALTER TABLE event_functions ADD COLUMN room_id INT"))
                    conn.commit()
                except: pass
            else:
                try:
                    conn.execute(text("ALTER TABLE event_functions ADD COLUMN room_id INTEGER"))
                    conn.commit()
                except: pass

            # Intentar añadir columnas si no existen (ignorando errores si ya existen)
            cols = [
                ("venues", "assigned_manager_id", "INTEGER"),
                ("venues", "city", "VARCHAR(255)"),
                ("venues", "municipality_id", "INTEGER"),
                ("events", "grid_span_x", "INTEGER DEFAULT 1"),
                ("events", "grid_span_y", "INTEGER DEFAULT 1"),
                ("events", "grid_page", "INTEGER DEFAULT 0"),
                ("events", "room_id", "INTEGER"),
                ("events", "venue_id", "INTEGER"),
                ("events", "use_seating_map", "BOOLEAN DEFAULT 0"),
                ("events", "ads_enabled", "BOOLEAN DEFAULT 0"),
                ("events", "max_ads", "INTEGER DEFAULT 5"),
                ("events", "merch_enabled", "BOOLEAN DEFAULT 0"),
                ("events", "metrics_enabled", "BOOLEAN DEFAULT 0"),
                ("events", "assigned_manager_id", "INTEGER"),
                ("events", "municipality_id", "INTEGER"),
                ("ads", "event_id", "INTEGER"),
                # --- PRESALE: Preventas exclusivas por banco ---
                ("events", "presale_enabled", "BOOLEAN DEFAULT 0"),
                ("events", "presale_bank_name", "VARCHAR(100)"),
                ("events", "presale_bins", "TEXT"),
                ("events", "presale_start", "VARCHAR(50)"),
                ("events", "presale_end", "VARCHAR(50)"),
            ]
            
            for table, col, col_type in cols:
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                    conn.commit()
                    print(f"[PROTOCOL] Columna {col} añadida a {table}")
                except Exception:
                    pass # Probablemente ya existe
        except Exception as e:
            print(f"[PROTOCOL] Error en migración: {e}")

# Ejecutar protocolo al cargar el módulo
init_events_db()

# ============================================
# CONEXIN CON FALLBACK MySQL → SQLite
# ============================================
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club3_v2')}"

try:
    engine = create_engine(MYSQL_URL, pool_pre_ping=True, connect_args={'connect_timeout': 2})
    engine.connect()
    print("[EVENT SERVICE] Conexin MySQL establecida.")
    run_migrations(engine)
except Exception:
    print("[EVENT SERVICE] MySQL no disponible. Usando SQLite de respaldo...")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///./{DB_PATH}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    run_migrations(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except:
            pass
