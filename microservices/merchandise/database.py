from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
import sqlite3
from datetime import datetime

# ============================================
# CONEXIÓN CON FALLBACK MySQL → SQLite
# ============================================
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club')}"
DB_PATH = "microservices/merchandise/merchandise.db"

def run_migrations(engine):
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            if engine.name == 'mysql':
                columns_to_add = [
                    ("merchandise_items", "category", "VARCHAR(100) NULL"),
                    ("merchandise_items", "is_official", "TINYINT(1) DEFAULT 1"),
                    ("merchandise_items", "rating", "FLOAT DEFAULT 4.5"),
                    ("merchandise_items", "status", "VARCHAR(50) DEFAULT 'draft'"),
                    ("merchandise_items", "admin_status", "VARCHAR(50) DEFAULT 'pending_review'"),
                    ("merchandise_items", "event_id", "INT NULL"),
                    ("merchandise_items", "attributes_schema", "JSON NULL"),
                    ("merchandise_items", "delivery_methods", "JSON NULL"),
                    ("merchandise_items", "max_per_person", "INT DEFAULT 5"),
                    ("merchandise_items", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                    ("merchandise_items", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
                    
                    ("merchandise_variants", "sku", "VARCHAR(100) NULL"),
                    ("merchandise_variants", "attributes", "JSON NULL"),
                    ("merchandise_variants", "price", "DECIMAL(10, 2) NOT NULL DEFAULT 0.00"),
                    ("merchandise_variants", "stock", "INT DEFAULT 0"),
                    ("merchandise_variants", "is_active", "TINYINT(1) DEFAULT 1"),
                    ("merchandise_variants", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                    ("merchandise_variants", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                ]
                for table, column, col_type in columns_to_add:
                    try:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type};"))
                        conn.commit()
                        print(f"[MERCH MIGRATION] Added column {column} to table {table} in MySQL.")
                    except Exception as col_ex:
                        # Column might already exist
                        pass
            else:
                columns_to_add_sqlite = [
                    ("merchandise_items", "category", "TEXT NULL"),
                    ("merchandise_items", "is_official", "BOOLEAN DEFAULT 1"),
                    ("merchandise_items", "rating", "FLOAT DEFAULT 4.5"),
                    ("merchandise_items", "status", "TEXT DEFAULT 'draft'"),
                    ("merchandise_items", "admin_status", "TEXT DEFAULT 'pending_review'"),
                    ("merchandise_items", "event_id", "INTEGER NULL"),
                    ("merchandise_items", "attributes_schema", "TEXT NULL"),
                    ("merchandise_items", "delivery_methods", "TEXT NULL"),
                    ("merchandise_items", "max_per_person", "INTEGER DEFAULT 5"),
                    ("merchandise_items", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                    ("merchandise_items", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                    
                    ("merchandise_variants", "sku", "TEXT NULL"),
                    ("merchandise_variants", "attributes", "TEXT NULL"),
                    ("merchandise_variants", "price", "DECIMAL(10, 2) NOT NULL DEFAULT 0.00"),
                    ("merchandise_variants", "stock", "INTEGER DEFAULT 0"),
                    ("merchandise_variants", "is_active", "BOOLEAN DEFAULT 1"),
                    ("merchandise_variants", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                    ("merchandise_variants", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP")
                ]
                for table, column, col_type in columns_to_add_sqlite:
                    try:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type};"))
                        conn.commit()
                        print(f"[MERCH MIGRATION] Added column {column} to table {table} in SQLite.")
                    except Exception as col_ex:
                        # Column might already exist
                        pass
        except Exception as e:
            print(f"[MERCH SERVICE] Error en migración: {e}")

try:
    engine = create_engine(MYSQL_URL, pool_pre_ping=True, connect_args={'connect_timeout': 2})
    engine.connect()
    print("[MERCH SERVICE] Conexión MySQL establecida.")
    run_migrations(engine)
except Exception:
    print("[MERCH SERVICE] MySQL no disponible. Usando SQLite de respaldo...")
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
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
