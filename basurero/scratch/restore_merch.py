import os
import sqlite3
import pymysql
from dotenv import load_dotenv
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import models from the microservice
# We need to add the project root to sys.path to import correctly if needed
import sys
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from microservices.merchandise.models import Base, MerchandiseItem, MerchandiseVariant, MerchandiseSettings

load_dotenv()

def restore_merchandise():
    print("--- INICIANDO RESTAURACIÓN DE LAIKA SHOP ---")

    # --- CONFIGURACIÓN DE CONEXIONES ---
    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_user = os.getenv('MYSQL_USER', 'root')
    mysql_pass = os.getenv('MYSQL_PASSWORD', '')
    mysql_db = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    sqlite_path = os.path.join(project_root, "microservices", "merchandise", "merchandise.db")

    # 1. LIMPIEZA PROFUNDA DE MYSQL (REPARACIÓN DE CORRUPCIÓN)
    print(f"\n[1/3] Reparando tablas en MySQL ({mysql_db})...")
    try:
        conn = pymysql.connect(host=mysql_host, user=mysql_user, password=mysql_pass, database=mysql_db)
        cursor = conn.cursor()
        
        # Desactivar llaves foráneas para poder borrar tablas corruptas
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        tables_to_clean = [
            'merchandise_order_items',
            'merchandise_orders',
            'merchandise_variants',
            'merchandise_items',
            'merchandise_settings'
        ]
        
        for table in tables_to_clean:
            print(f" -> Eliminando tabla: {table}")
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table};")
            except Exception as e:
                print(f"    ! Error al borrar {table}: {e}")
                
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()
        conn.close()
        print(" OK: Tablas antiguas eliminadas.")
    except Exception as e:
        print(f" ERROR en limpieza MySQL: {e}")

    # 2. CREACIÓN DE TABLAS Y SEEDING (MYSQL)
    print(f"\n[2/3] Re-creando categorías y productos premium en MySQL...")
    mysql_url = f"mysql+pymysql://{mysql_user}:{mysql_pass}@{mysql_host}/{mysql_db}"
    engine_mysql = create_engine(mysql_url)
    
    try:
        Base.metadata.create_all(bind=engine_mysql)
        SessionMySQL = sessionmaker(bind=engine_mysql)
        session = SessionMySQL()
        seed_data(session)
        session.close()
        print(" OK: MySQL poblado con éxito.")
    except Exception as e:
        print(f" ERROR en seeding MySQL: {e}")

    # 3. SEEDING DE RESPALDO (SQLITE)
    print(f"\n[3/3] Sincronizando base de datos SQLite ({sqlite_path})...")
    try:
        if os.path.exists(sqlite_path):
            os.remove(sqlite_path)
            
        sqlite_url = f"sqlite:///{sqlite_path}"
        engine_sqlite = create_engine(sqlite_url)
        Base.metadata.create_all(bind=engine_sqlite)
        SessionSQLite = sessionmaker(bind=engine_sqlite)
        session_sq = SessionSQLite()
        seed_data(session_sq)
        session_sq.close()
        print(" OK: SQLite sincronizado.")
    except Exception as e:
        print(f" ERROR en seeding SQLite: {e}")

def seed_data(session):
    # --- CONFIGURACIÓN DE TIENDA ---
    settings = MerchandiseSettings(
        manager_id=1,
        is_enabled=True,
        commission_percentage=Decimal("15.00")
    )
    session.add(settings)
    
    # --- CATÁLOGO PREMIUM ---
    products = [
        {
            "name": "Vinilo: After Hours (Red Edition)",
            "desc": "Edición especial de coleccionista en color rojo translúcido. Sonido analógico premium.",
            "cat": "Vinyls",
            "img": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800",
            "price": 850.00,
            "stock": 15
        },
        {
            "name": "Hoodie Industrial 'Laika Staff'",
            "desc": "Sudadera de alta densidad con logos reflectivos. Corte oversize premium.",
            "cat": "Hoodies",
            "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
            "price": 1200.00,
            "stock": 25
        },
        {
            "name": "Trucker Hat: Neon Glitch",
            "desc": "Gorra con bordado 3D y visera curva. Ajustable, edición limitada.",
            "cat": "Gorras",
            "img": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?w=800",
            "price": 450.00,
            "stock": 50
        },
        {
            "name": "Taza Cerámica: Dark Minimal",
            "desc": "Taza de cerámica mate con logo grabado en láser. 15oz.",
            "cat": "Tazas",
            "img": "https://images.unsplash.com/photo-1517256010-52f05a72d48b?w=800",
            "price": 320.00,
            "stock": 100
        },
        {
            "name": "Termo Acero: 24h Cold",
            "desc": "Botella térmica de doble pared. Mantiene tus bebidas frías todo el día.",
            "cat": "Vasos",
            "img": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?w=800",
            "price": 680.00,
            "stock": 40
        },
        {
            "name": "Playera: Staff Access Only",
            "desc": "Algodón 100% orgánico. Diseño minimalista frontal y detallado en espalda.",
            "cat": "Playeras",
            "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
            "price": 550.00,
            "stock": 80
        },
        {
            "name": "Llavero Iridiscente: Laika Key",
            "desc": "Acrílico con efecto tornasol y herraje de acero negro.",
            "cat": "Llaveros",
            "img": "https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800",
            "price": 180.00,
            "stock": 200
        },
        {
            "name": "Pack Stickers: Glow in the Dark",
            "desc": "5 calcomanías de vinil premium que brillan en la oscuridad.",
            "cat": "Stickers",
            "img": "https://images.unsplash.com/photo-1572375927501-44447e533464?w=800",
            "price": 120.00,
            "stock": 500
        },
        {
            "name": "Poster Litográfico: Tour 2026",
            "desc": "Impresión en papel satinado de 300g. Medidas 50x70cm.",
            "cat": "Poster",
            "img": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800",
            "price": 250.00,
            "stock": 150
        },
        {
            "name": "Beanie: Midnight Blue",
            "desc": "Gorro tejido de lana sintética. Suave, cálido y minimalista.",
            "cat": "Gorras",
            "img": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800",
            "price": 380.00,
            "stock": 60
        },
        {
            "name": "CD Autografiado: Genesis",
            "desc": "Primer álbum de estudio de Laika Club. Incluye booklet extendido.",
            "cat": "Discos",
            "img": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
            "price": 400.00,
            "stock": 30
        }
    ]

    for p in products:
        item = MerchandiseItem(
            name=p["name"],
            description=p["desc"],
            category=p["cat"],
            image_url=p["img"],
            status="published",
            manager_id=1
        )
        session.add(item)
        session.flush() # Para obtener el ID
        
        variant = MerchandiseVariant(
            item_id=item.id,
            sku=f"SKU-{p['cat'][:3].upper()}-{item.id}",
            price=Decimal(str(p["price"])),
            stock=p["stock"],
            size="Universal/OS",
            is_active=True
        )
        session.add(variant)

    session.commit()
    print(f" -> {len(products)} productos inyectados exitosamente.")

if __name__ == "__main__":
    restore_merchandise()
