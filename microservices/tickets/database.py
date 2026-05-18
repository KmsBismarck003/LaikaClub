from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "microservices/tickets/tickets.db"

# ============================================
# PROTOCOLO DE AUTORECUPERACIÓN (FALLBACK)
# ============================================
def init_tickets_db():
    """Verifica si la base de datos existe, si no, la crea (Fallback Protocol)"""
    if not os.path.exists(DB_PATH):
        print("[FALLBACK] Tickets DB no encontrada. Recreando...")
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                ticket_code TEXT UNIQUE NOT NULL,
                qr_data TEXT,
                section_name TEXT,
                seat_id TEXT,
                price REAL DEFAULT 0,
                status TEXT DEFAULT 'active',
                payment_method TEXT,
                redeemed_at TEXT,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_id INTEGER,
                amount REAL NOT NULL,
                payment_method TEXT,
                status TEXT DEFAULT 'completed',
                reference TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()
        print("[FALLBACK] Tickets DB inicializada con éxito.")
    else:
        # MIGRACIÓN: Verificar columnas nuevas
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(tickets)")
        existing_columns = [col[1] for col in cursor.fetchall()]

        needed_columns = {
            "section_name": "TEXT",
            "seat_id": "TEXT",
            "price": "REAL DEFAULT 0",
            "payment_method": "TEXT",
            "qr_data": "TEXT",
            "redeemed_at": "TEXT",
            "purchase_date": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        }

        migration_done = False
        for col_name, col_type in needed_columns.items():
            if col_name not in existing_columns:
                print(f"[PROTOCOL] Tickets DB: Añadiendo columna {col_name}...")
                cursor.execute(f"ALTER TABLE tickets ADD COLUMN {col_name} {col_type}")
                migration_done = True

        # Asegurar tabla payments
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_id INTEGER,
                amount REAL NOT NULL,
                payment_method TEXT,
                status TEXT DEFAULT 'completed',
                reference TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        if migration_done:
            conn.commit()
            print("[PROTOCOL] Tickets DB migración completada.")
        else:
            conn.commit()
        conn.close()

# Ejecutar protocolo al cargar el módulo
init_tickets_db()

def run_migrations(engine):
    """Ejecuta migraciones de esquema en la base de datos activa (MySQL o SQLite)."""
    with engine.connect() as conn:
        print(f"[TICKET SERVICE PROTOCOL] Verificando esquema en {engine.name}...")
        
        # 1. Crear tablas if not exists
        if engine.name == 'mysql':
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tickets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    event_id INT NOT NULL,
                    ticket_code VARCHAR(100) UNIQUE NOT NULL,
                    qr_data TEXT,
                    section_name VARCHAR(100),
                    seat_id VARCHAR(100),
                    price DOUBLE DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'active',
                    payment_method VARCHAR(50),
                    redeemed_at VARCHAR(100),
                    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    event_id INT,
                    amount DOUBLE NOT NULL,
                    payment_method VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'completed',
                    reference VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Modificar columnas para evitar fallos por enums estrictos
            try:
                conn.execute(text("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50)"))
                print("[TICKET SERVICE PROTOCOL] MySQL: payment_method modificado a VARCHAR(50)")
            except Exception as e:
                print(f"[TICKET SERVICE PROTOCOL] MySQL payment_method alter warning: {e}")
            
            try:
                conn.execute(text("ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'"))
                print("[TICKET SERVICE PROTOCOL] MySQL: status modificado a VARCHAR(50)")
            except Exception as e:
                print(f"[TICKET SERVICE PROTOCOL] MySQL status alter warning: {e}")
                
        else:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tickets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    event_id INTEGER NOT NULL,
                    ticket_code TEXT UNIQUE NOT NULL,
                    qr_data TEXT,
                    section_name TEXT,
                    seat_id TEXT,
                    price REAL DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    payment_method TEXT,
                    redeemed_at TEXT,
                    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    event_id INTEGER,
                    amount REAL NOT NULL,
                    payment_method TEXT,
                    status TEXT DEFAULT 'completed',
                    reference TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
        conn.commit()

        # 2. Asegurar que todas las columnas existen (intento de alter table no destructivo)
        columns_to_add = [
            ("tickets", "purchase_date", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
            ("tickets", "section_name", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("tickets", "seat_id", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("tickets", "price", "DOUBLE DEFAULT 0" if engine.name == 'mysql' else "REAL DEFAULT 0"),
            ("tickets", "payment_method", "VARCHAR(50)" if engine.name == 'mysql' else "TEXT"),
            ("tickets", "qr_data", "TEXT"),
            ("tickets", "redeemed_at", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("payments", "event_id", "INT" if engine.name == 'mysql' else "INTEGER"),
            ("payments", "reference", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("payments", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
        ]
        
        for table, col, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"[TICKET SERVICE PROTOCOL] Columna {col} añadida a {table}")
            except Exception:
                pass # Ignorar si ya existe

# ============================================
# CONEXIÓN CON FALLBACK MySQL → SQLite
# ============================================
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club')}"

try:
    engine = create_engine(MYSQL_URL, pool_pre_ping=True, connect_args={'connect_timeout': 2})
    engine.connect()
    print("[TICKET SERVICE] Conexión MySQL establecida.")
    run_migrations(engine)
except Exception:
    print("[TICKET SERVICE] MySQL no disponible. Usando SQLite de respaldo...")
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
        db.close()
