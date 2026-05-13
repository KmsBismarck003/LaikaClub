import os
import sqlite3
import pymysql
from dotenv import load_dotenv
from datetime import datetime, timedelta
import sys

# Ruta del proyecto
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

# Cargar variables de entorno
load_dotenv()

# Intentar importar la lógica de hashing del microservicio para total fidelidad
try:
    from microservices.auth.security import get_password_hash
except ImportError:
    # Fallback si no se puede importar
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def get_password_hash(password):
        return pwd_context.hash(password)

def restore_auth_system():
    print("--- INICIANDO RESTAURACIÓN DEL SISTEMA DE AUTENTICACIÓN ---")

    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_user = os.getenv('MYSQL_USER', 'root')
    mysql_pass = os.getenv('MYSQL_PASSWORD', '')
    mysql_db = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    sqlite_path = os.path.join(project_root, "microservices", "auth", "auth.db")

    # 1. REPARACIÓN DE MYSQL
    print(f"\n[1/3] Limpiando y recreando tablas en MySQL ({mysql_db})...")
    try:
        conn = pymysql.connect(host=mysql_host, user=mysql_user, password=mysql_pass, database=mysql_db)
        cursor = conn.cursor()
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        tables = ['auth_logs', 'permission_requests', 'users']
        for table in tables:
            print(f" -> Eliminando {table}")
            cursor.execute(f"DROP TABLE IF EXISTS {table};")
            
        print(" -> Creando tabla: users")
        cursor.execute("""
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(191) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password_hash VARCHAR(255),
                role VARCHAR(50),
                status VARCHAR(20) DEFAULT 'active',
                last_login VARCHAR(100),
                failed_attempts INT DEFAULT 0,
                lockout_until VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                social_provider VARCHAR(50),
                reset_token VARCHAR(100),
                reset_token_expires VARCHAR(100),
                avatar_url TEXT,
                is_premium BOOLEAN DEFAULT FALSE,
                premium_until VARCHAR(100),
                permissions TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        print(" -> Creando tabla: auth_logs")
        cursor.execute("""
            CREATE TABLE auth_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(255),
                email VARCHAR(191),
                role VARCHAR(50),
                event_type VARCHAR(100),
                ip_address VARCHAR(50),
                user_agent TEXT,
                summary TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        print(" -> Creando tabla: permission_requests")
        cursor.execute("""
            CREATE TABLE permission_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                permission_type VARCHAR(100),
                status VARCHAR(20) DEFAULT 'pending',
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        
        # SEEDING DE USUARIOS
        seed_users_mysql(cursor)
        
        conn.commit()
        conn.close()
        print(" OK: MySQL restaurado y poblado.")
    except Exception as e:
        print(f" ERROR en MySQL: {e}")

    # 2. SINCRONIZACIÓN DE SQlite
    print(f"\n[2/3] Sincronizando respaldo SQLite ({sqlite_path})...")
    try:
        if os.path.exists(sqlite_path):
            os.remove(sqlite_path)
            
        conn_sq = sqlite3.connect(sqlite_path)
        cur_sq = conn_sq.cursor()
        
        cur_sq.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                phone TEXT, password_hash TEXT, role TEXT, status TEXT,
                last_login TEXT, failed_attempts INTEGER DEFAULT 0,
                lockout_until TEXT, created_at TEXT, social_provider TEXT,
                reset_token TEXT, reset_token_expires TEXT, avatar_url TEXT,
                is_premium INTEGER DEFAULT 0, premium_until TEXT, permissions TEXT
            )
        """)
        
        seed_users_sqlite(cur_sq)
        
        conn_sq.commit()
        conn_sq.close()
        print(" OK: SQLite sincronizado.")
    except Exception as e:
        print(f" ERROR en SQLite: {e}")

def get_test_users():
    hash_admin = get_password_hash("admin123")
    hash_gestor = get_password_hash("gestros123")
    hash_operador = get_password_hash("operdor123")
    hash_usuario = get_password_hash("usuario123")
    
    return [
        ("Admin", "Master", "admin@laikaclub.com", "admin", hash_admin),
        ("Gestor", "Principal", "gestor@laikaclub.com", "gestor", hash_gestor),
        ("Operador", "Logística", "operador@laikaclub.com", "operador", hash_operador),
        ("Usuario", "Premium", "usuario@laikaclub.com", "usuario", hash_usuario),
    ]

def seed_users_mysql(cursor):
    users = get_test_users()
    for fname, lname, email, role, hpwd in users:
        print(f" -> Injecting {role}: {email}")
        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, role, password_hash, status)
            VALUES (%s, %s, %s, %s, %s, 'active')
        """, (fname, lname, email, role, hpwd))

def seed_users_sqlite(cursor):
    users = get_test_users()
    for fname, lname, email, role, hpwd in users:
        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, role, password_hash, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'active', ?)
        """, (fname, lname, email, role, hpwd, datetime.now().isoformat()))

if __name__ == "__main__":
    restore_auth_system()
