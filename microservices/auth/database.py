from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

# Ruta de la base de datos SQLite
DB_PATH = "microservices/auth/auth.db"

# ============================================
# PROTOCOLO DE AUTORECUPERACIÓN (FALLBACK)
# ============================================
def init_auth_db():
    """Verifica si la base de datos existe, si no, la crea (Fallback Protocol)"""
    if not os.path.exists(DB_PATH):
        print("[FALLBACK] Auth DB no encontrada. Recreando...")
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        scur = conn.cursor()
        scur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                phone TEXT, password_hash TEXT, role TEXT, status TEXT,
                last_login TEXT, failed_attempts INTEGER DEFAULT 0,
                lockout_until TEXT, created_at TEXT, social_provider TEXT,
                reset_token TEXT, reset_token_expires TEXT, avatar_url TEXT,
                permissions TEXT
            )
        """)
        scur.execute("""
            CREATE TABLE IF NOT EXISTS permission_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                permission_type TEXT,
                status TEXT DEFAULT 'pending',
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        scur.execute("""
            CREATE TABLE IF NOT EXISTS auth_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_name TEXT,
                email TEXT,
                role TEXT,
                event_type TEXT,
                ip_address TEXT,
                user_agent TEXT,
                summary TEXT,
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        """)
        conn.commit()
        conn.close()
        print("[FALLBACK] Auth DB inicializada con éxito.")
    else:
        # MIGRACIÓN: Verificar si existen las columnas necesarias en DB existente
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        
        needed_columns = {
            "social_provider": "TEXT",
            "reset_token": "TEXT",
            "reset_token_expires": "TEXT",
            "permissions": "TEXT",
            "avatar_url": "TEXT"
        }
        
        migration_done = False
        for col_name, col_type in needed_columns.items():
            if col_name not in existing_columns:
                print(f"[PROTOCOL] Migrando DB: Añadiendo columna {col_name}...")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                migration_done = True
        
        # Crear tabla auth_logs si no existe (migración no destructiva)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_name TEXT,
                email TEXT,
                role TEXT,
                event_type TEXT,
                ip_address TEXT,
                user_agent TEXT,
                summary TEXT,
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        """)
        
        if migration_done:
            conn.commit()
            print("[PROTOCOL] Migración completada.")
        else:
            conn.commit()
        conn.close()

# Ejecutar protocolo al cargar el módulo
init_auth_db()

def run_migrations(engine):
    """Ejecuta migraciones de esquema en la base de datos activa (MySQL o SQLite)."""
    with engine.connect() as conn:
        print(f"[AUTH SERVICE PROTOCOL] Verificando esquema en {engine.name}...")
        
        # 1. Crear tablas if not exists
        if engine.name == 'mysql':
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    phone VARCHAR(50),
                    password_hash VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'usuario',
                    status VARCHAR(50) DEFAULT 'active',
                    last_login VARCHAR(100),
                    failed_attempts INT DEFAULT 0,
                    lockout_until VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    social_provider VARCHAR(50),
                    reset_token VARCHAR(100),
                    reset_token_expires VARCHAR(100),
                    avatar_url VARCHAR(255),
                    permissions TEXT
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS permission_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    permission_type VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'pending',
                    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_perm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS auth_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    user_name VARCHAR(255),
                    email VARCHAR(100),
                    role VARCHAR(50),
                    event_type VARCHAR(100),
                    ip_address VARCHAR(50),
                    user_agent TEXT,
                    summary TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
        else:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                    phone TEXT, password_hash TEXT, role TEXT, status TEXT,
                    last_login TEXT, failed_attempts INTEGER DEFAULT 0,
                    lockout_until TEXT, created_at TEXT, social_provider TEXT,
                    reset_token TEXT, reset_token_expires TEXT, avatar_url TEXT,
                    permissions TEXT
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS permission_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    permission_type TEXT,
                    status TEXT DEFAULT 'pending',
                    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS auth_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    user_name TEXT,
                    email TEXT,
                    role TEXT,
                    event_type TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    summary TEXT,
                    created_at TEXT DEFAULT (datetime('now', 'localtime'))
                )
            """))
        conn.commit()

        # 2. Asegurar que todas las columnas existen (intento de alter table no destructivo)
        columns_to_add = [
            ("users", "social_provider", "VARCHAR(50)" if engine.name == 'mysql' else "TEXT"),
            ("users", "reset_token", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("users", "reset_token_expires", "VARCHAR(100)" if engine.name == 'mysql' else "TEXT"),
            ("users", "permissions", "TEXT"),
            ("users", "avatar_url", "VARCHAR(255)" if engine.name == 'mysql' else "TEXT"),
        ]
        
        for table, col, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"[AUTH SERVICE PROTOCOL] Columna {col} añadida a {table}")
            except Exception:
                pass # Ignorar si ya existe

# ============================================
# CONEXIÓN CON FALLBACK MySQL → SQLite
# ============================================
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club3_v2')}"

try:
    engine = create_engine(MYSQL_URL, pool_pre_ping=True, connect_args={'connect_timeout': 2})
    engine.connect()
    print("[AUTH SERVICE] Conexión MySQL establecida.")
    run_migrations(engine)
except Exception as e:
    print(f"[AUTH SERVICE] MySQL no disponible ({e}). Usando SQLite de respaldo...")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///./{DB_PATH}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    run_migrations(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================
# PROTOCOLO ADMIN SEED
# ============================================
def seed_admin_user():
    """
    Verifica que exista al menos un usuario administrador.
    Si no hay ninguno, crea un admin por defecto con credenciales temporales.
    """
    import hashlib
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT COUNT(*) FROM users WHERE role='admin'")).fetchone()
        admin_count = result[0] if result else 0

        if admin_count == 0:
            print("[ADMIN SEED] No se encontró ningún administrador. Creando admin por defecto...")
            temp_password = "gearsof2"
            try:
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                password_hash = pwd_context.hash(temp_password)
            except ImportError:
                import hashlib
                password_hash = hashlib.sha256(temp_password.encode()).hexdigest()

            from datetime import datetime
            db.execute(text("""
                INSERT INTO users (
                    first_name, last_name, email, phone,
                    password_hash, role, status, created_at
                ) VALUES (:fn, :ln, :email, :phone, :hash, 'admin', 'active', :now)
            """), {
                "fn": "Admin", "ln": "LAIKA",
                "email": "admin@laikaclub.com", "phone": "0000000000",
                "hash": password_hash, "now": datetime.now().isoformat()
            })
            db.commit()
            print("[ADMIN SEED] Admin creado: admin@laikaclub.com / gearsof2")
        else:
            print(f"[ADMIN SEED] {admin_count} administrador(es) verificado(s). Sin acción necesaria.")
    except Exception as e:
        print(f"[ADMIN SEED ERROR] No se pudo verificar/crear el admin: {e}")
        db.rollback()
    finally:
        db.close()

seed_admin_user()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
