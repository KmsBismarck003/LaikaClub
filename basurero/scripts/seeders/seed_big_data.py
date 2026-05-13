#!/usr/bin/env python3
"""
seed_big_data.py — Laika Club
Inyeccion masiva de datos ficticios para Big Data y ML.
Inserta ~162,000+ registros en SQLite + MongoDB Atlas.
NO borra datos reales existentes (INSERT OR IGNORE).
"""

import subprocess
import sys

# ─── AUTO-INSTALAR DEPENDENCIAS ───────────────────────────────────────────────
def ensure_package(package, import_name=None):
    try:
        __import__(import_name or package)
    except ImportError:
        print(f"[INSTALL] Instalando {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

for pkg, imp in [("faker", "faker"), ("pymongo", "pymongo"), ("python-dotenv", "dotenv"), ("dnspython", "dns")]:
    ensure_package(pkg, imp)

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
import sqlite3
import random
import uuid
import os
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from faker import Faker

fake = Faker("es_MX")
Faker.seed(42)
random.seed(42)

# Cargar .env desde la raiz del proyecto
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# ─── PATHS DE BASES DE DATOS ──────────────────────────────────────────────────
AUTH_DB   = BASE_DIR / "microservices" / "auth"       / "auth.db"
EVENTS_DB = BASE_DIR / "microservices" / "events"     / "events.db"
TICKETS_DB= BASE_DIR / "microservices" / "tickets"    / "tickets.db"
MERCH_DB  = BASE_DIR / "microservices" / "merchandise"/ "merchandise.db"

# ─── MONGODB ATLAS ────────────────────────────────────────────────────────────
MONGO_URI     = os.getenv("MONGO_URI", "").strip('"').strip("'")
MONGO_DB_NAME = os.getenv("MONGO_DB", "laika_analytics").strip('"').strip("'")

# ─── CONSTANTES ───────────────────────────────────────────────────────────────
VENUES = [
    "Foro Sol", "Palacio de los Deportes", "Arena CDMX", "Auditorio Nacional",
    "Estadio Azteca", "Pepsi Center WTC", "Teatro Metropolitan", "El Plaza Condesa",
    "Lunario del Auditorio", "Expo Guadalajara", "Palenque de la Feria",
    "Centro Banamex", "Arena Monterrey", "Estadio Akron", "Salon de la Fama",
    "Foro Indie Rocks", "Circo Volador", "El Tejedor", "Zocalo CDMX",
]
PAYMENT_METHODS   = ["tarjeta", "efectivo", "transferencia", "paypal", "oxxo", "spei"]
TICKET_SECTIONS   = ["VIP", "General", "Platinum", "Gold", "Campo", "Preferente"]
CATEGORIES        = ["concert", "festival", "sport", "theater", "other"]
MERCH_CATEGORIES  = ["playeras", "sudaderas", "gorras", "stickers", "tazas", "llaveros", "posters", "accesorios"]
MERCH_SIZES       = ["XS", "S", "M", "L", "XL", "XXL", "Unica"]
MERCH_COLORS      = ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Gris", "Morado", "Naranja", "Rosa", "Amarillo"]
LOG_TYPES         = ["login_success", "login_failed", "logout", "password_reset", "account_locked"]
ARTISTS = [
    "Bad Bunny", "Peso Pluma", "Grupo Frontera", "Rosalia", "Natanael Cano",
    "Fuerza Regida", "Banda MS", "Los Angeles Azules", "Calibre 50",
    "Junior H", "Carin Leon", "Xavi", "Ovi", "Snow Tha Product",
    "Laika Club Fest", "Noche de Rock", "Festival Electronico", "Jazz Blues Night",
    "Metallica", "Bad Gyal", "Karol G", "J Balvin", "Maluma", "Rauw Alejandro",
    "Daddy Yankee", "Anuel AA", "Myke Towers", "Farruko", "Ozuna",
]
BAND_NAMES = ["Laika", "Wolf Pack", "Luna", "Estrella", "Noche", "Club", "Electro", "Cosmic", "Boreal", "Sol"]

# Distribucion de roles y estatus
ROLES_POOL   = random.choices(["usuario", "organizador", "admin"], weights=[90, 8, 2], k=15000)
STATUSES_POOL= random.choices(["active", "inactive", "banned"],   weights=[85, 10, 5], k=15000)

# ─── HELPERS ──────────────────────────────────────────────────────────────────
def random_date(start_year=2023, end_year=2026):
    start = datetime(start_year, 1, 1)
    end   = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

def random_datetime(start_year=2024, end_year=2026):
    dt = random_date(start_year, end_year)
    # Pesos horarios: picos en tarde-noche
    hour = random.choices(
        range(24),
        weights=[1,1,1,1,1,1,2,3,4,4,4,4,4,4,4,5,5,6,7,8,8,7,5,3],
        k=1
    )[0]
    return dt.replace(hour=hour, minute=random.randint(0,59), second=random.randint(0,59))

def batch_insert(conn, sql, data, batch_size=1000, desc=""):
    if not data:
        return
    cursor = conn.cursor()
    total  = len(data)
    for i in range(0, total, batch_size):
        batch = data[i:i + batch_size]
        cursor.executemany(sql, batch)
        conn.commit()
        done = min(i + batch_size, total)
        print(f"\r    [{desc}] {done}/{total}", end="", flush=True)
    print()

def mongo_batch_insert(collection, data, batch_size=1000, desc=""):
    if not data:
        return
    total = len(data)
    for i in range(0, total, batch_size):
        collection.insert_many(data[i:i + batch_size])
        done = min(i + batch_size, total)
        print(f"\r    [Atlas:{desc}] {done}/{total}", end="", flush=True)
    print()


# ══════════════════════════════════════════════════════════════════════════════
# 1. USUARIOS — auth.db
# ══════════════════════════════════════════════════════════════════════════════
def seed_users(n=10000):
    print(f"\n[1/6] Generando {n} usuarios...")
    conn   = sqlite3.connect(AUTH_DB)
    cursor = conn.cursor()

    # Cuantos hay ya
    cursor.execute("SELECT COUNT(*) FROM users")
    existing = cursor.fetchone()[0]
    if existing >= n:
        print(f"    Ya existen {existing} usuarios. Saltando.")
        user_ids = [r[0] for r in cursor.execute("SELECT id FROM users LIMIT ?", (n,)).fetchall()]
        conn.close()
        return [], user_ids

    records       = []
    mongo_records = []
    used_emails   = set()

    for i in range(n):
        try:
            email = fake.unique.email()
        except Exception:
            email = f"user_{uuid.uuid4().hex[:12]}@laika.mx"
        used_emails.add(email)

        created    = random_datetime(2023, 2025)
        last_login = random_datetime(2025, 2026) if random.random() > 0.2 else None
        role       = ROLES_POOL[i % len(ROLES_POOL)]
        status     = STATUSES_POOL[i % len(STATUSES_POOL)]

        # Hash falso pero con formato bcrypt valido
        fake_hash = "$2b$12$" + "".join(random.choices(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./", k=53
        ))

        records.append((
            fake.first_name(), fake.last_name(), email,
            fake.phone_number()[:20], fake_hash,
            role, status,
            last_login.isoformat() if last_login else None,
            0, None, created.isoformat(),
            None, None, None, None
        ))
        mongo_records.append({
            "first_name": records[-1][0], "last_name": records[-1][1],
            "email": email, "role": role, "status": status,
            "created_at": created.isoformat(), "source": "seed_faker"
        })

    sql = """
        INSERT OR IGNORE INTO users
        (first_name, last_name, email, phone, password_hash, role, status,
         last_login, failed_attempts, lockout_until, created_at,
         social_provider, reset_token, reset_token_expires, avatar_url)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql, records, desc="users")

    cursor.execute("SELECT id FROM users LIMIT ?", (n + existing,))
    user_ids = [r[0] for r in cursor.fetchall()]
    conn.close()
    return mongo_records, user_ids


# ══════════════════════════════════════════════════════════════════════════════
# 2. AUTH LOGS / SESIONES — auth.db
# ══════════════════════════════════════════════════════════════════════════════
def seed_auth_logs(user_ids, n=50000):
    print(f"\n[2/6] Generando {n} logs de sesion...")
    conn = sqlite3.connect(AUTH_DB)

    browsers = ["Chrome/120", "Firefox/121", "Safari/17", "Edge/119", "Opera/105", "Chrome Mobile/120"]
    records       = []
    mongo_records = []

    for _ in range(n):
        uid        = random.choice(user_ids)
        event_type = random.choices(LOG_TYPES, weights=[60, 20, 10, 5, 5], k=1)[0]
        dt         = random_datetime(2024, 2026)
        ip         = f"187.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
        browser    = random.choice(browsers)
        role       = random.choice(["usuario", "organizador", "admin"])

        records.append((
            uid, f"Usuario_{uid}", f"user{uid}@laika.mx",
            role, event_type, ip,
            f"Mozilla/5.0 ({browser})",
            f"Evento '{event_type}' desde IP {ip}",
            dt.isoformat()
        ))
        mongo_records.append({
            "user_id": uid, "event_type": event_type,
            "ip_address": ip, "browser": browser, "role": role,
            "created_at": dt.isoformat(), "source": "seed_faker"
        })

    sql = """
        INSERT INTO auth_logs
        (user_id, user_name, email, role, event_type, ip_address, user_agent, summary, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql, records, desc="auth_logs")
    conn.close()
    return mongo_records


# ══════════════════════════════════════════════════════════════════════════════
# 3. EVENTOS / ESCENARIOS — events.db
# ══════════════════════════════════════════════════════════════════════════════
def seed_events(n=500):
    print(f"\n[3/6] Generando {n} eventos/escenarios...")
    conn   = sqlite3.connect(EVENTS_DB)
    cursor = conn.cursor()

    records       = []
    mongo_records = []

    for i in range(n):
        cat    = random.choice(CATEGORIES)
        artist = random.choice(ARTISTS)
        venue  = random.choice(VENUES)
        price  = round(random.uniform(200, 2500), 2)
        total  = random.randint(500, 15000)
        avail  = random.randint(0, total)
        edate  = random_date(2024, 2026)
        hour   = random.randint(17, 22)
        created= datetime(2023, 1, 1) + timedelta(days=random.randint(0, 700))

        records.append((
            f"{artist} en {venue}",
            f"Gran evento de {cat}: {artist}. Vive una experiencia unica en {venue}.",
            edate.strftime("%Y-%m-%d"), f"{hour:02d}:00:00",
            venue, venue, cat,
            price, total, avail,
            f"https://laikaclub.mx/events/img_{i+1}.jpg",
            "published", 1,
            random.randint(0, 5), random.randint(0, 5), 1, 1, random.randint(0, 3),
            created
        ))
        mongo_records.append({
            "name": records[-1][0], "category": cat, "venue": venue,
            "price": price, "event_date": edate.isoformat(),
            "total_tickets": total, "available_tickets": avail,
            "source": "seed_faker"
        })

    sql = """
        INSERT OR IGNORE INTO events
        (name, description, event_date, event_time, location, venue, category,
         price, total_tickets, available_tickets, image_url, status, created_by,
         grid_position_x, grid_position_y, grid_span_x, grid_span_y, grid_page, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql, records, desc="events")

    # Secciones de boletos (3 x evento)
    cursor.execute("SELECT id FROM events ORDER BY id DESC LIMIT ?", (n,))
    event_ids = [r[0] for r in cursor.fetchall()]

    section_records = []
    section_price_mult = {"VIP": 3.0, "Platinum": 2.5, "Gold": 2.0, "General": 1.0, "Campo": 1.2, "Preferente": 1.5}
    for eid in event_ids:
        sections = random.sample(TICKET_SECTIONS, k=random.randint(2, 4))
        for sec_name in sections:
            mult  = section_price_mult.get(sec_name, 1.0)
            sprice= round(random.uniform(200, 800) * mult, 2)
            cap   = random.randint(100, 3000)
            section_records.append((
                eid, sec_name, sprice, cap, random.randint(0, cap),
                "DISPONIBLE" if random.random() > 0.3 else "AGOTADO",
                f"#{random.randint(0x100000, 0xFFFFFF):06X}"
            ))

    sql2 = """
        INSERT OR IGNORE INTO event_ticket_sections
        (event_id, name, price, capacity, available, badge_text, color_hex)
        VALUES (?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql2, section_records, desc="ticket_sections")
    conn.close()
    return event_ids, mongo_records


# ══════════════════════════════════════════════════════════════════════════════
# 4. TICKETS + PAGOS — tickets.db
# ══════════════════════════════════════════════════════════════════════════════
def seed_tickets(user_ids, event_ids, n=30000):
    print(f"\n[4/6] Generando {n} tickets y pagos...")
    conn = sqlite3.connect(TICKETS_DB)

    ticket_records  = []
    payment_records = []
    mongo_records   = []

    for _ in range(n):
        uid     = random.choice(user_ids)
        eid     = random.choice(event_ids)
        section = random.choice(TICKET_SECTIONS)
        price   = round(random.uniform(200, 2500), 2)
        method  = random.choice(PAYMENT_METHODS)
        status  = random.choices(["active", "redeemed", "cancelled"], weights=[60, 30, 10], k=1)[0]
        dt      = random_datetime(2024, 2026)
        code    = f"LK-{uuid.uuid4().hex[:10].upper()}"

        ticket_records.append((
            uid, eid, code,
            f"QR:{code}",
            section, f"A-{random.randint(1,50)}",
            price, status, method,
            dt.isoformat() if status == "redeemed" else None,
            dt.isoformat(), dt.isoformat()
        ))
        payment_records.append((
            uid, eid, price, method, "completed",
            f"REF-{uuid.uuid4().hex[:8].upper()}",
            dt.isoformat()
        ))
        mongo_records.append({
            "user_id": uid, "event_id": eid, "ticket_code": code,
            "section": section, "price": price, "status": status,
            "payment_method": method, "purchase_date": dt.isoformat(),
            "source": "seed_faker"
        })

    sql_t = """
        INSERT OR IGNORE INTO tickets
        (user_id, event_id, ticket_code, qr_data, section_name, seat_id,
         price, status, payment_method, redeemed_at, purchase_date, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """
    sql_p = """
        INSERT INTO payments
        (user_id, event_id, amount, payment_method, status, reference, created_at)
        VALUES (?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql_t, ticket_records, desc="tickets")
    batch_insert(conn, sql_p, payment_records, desc="payments")
    conn.close()
    return mongo_records


# ══════════════════════════════════════════════════════════════════════════════
# 5. MERCANCIA — merchandise.db
# ══════════════════════════════════════════════════════════════════════════════
def seed_merchandise(user_ids, n_orders=20000):
    print(f"\n[5/6] Generando mercancia y {n_orders} ventas...")
    conn   = sqlite3.connect(MERCH_DB)
    cursor = conn.cursor()

    # Asegurar que las tablas existen
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS merchandise_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, description TEXT, image_url TEXT,
            manager_id INTEGER DEFAULT 1, category TEXT,
            is_official INTEGER DEFAULT 1, rating REAL DEFAULT 4.5,
            status TEXT DEFAULT 'published',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS merchandise_variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER, sku TEXT, size TEXT, color TEXT,
            price REAL, stock INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS merchandise_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, total_amount REAL,
            total_commission REAL, net_amount REAL,
            status TEXT DEFAULT 'completed', payment_method TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS merchandise_order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER, variant_id INTEGER,
            quantity INTEGER, unit_price REAL
        );
    """)
    conn.commit()

    # ─── Items (200) ──────────────────────────────────────────────────────────
    item_records = []
    for _ in range(200):
        cat  = random.choice(MERCH_CATEGORIES)
        band = random.choice(BAND_NAMES)
        item_records.append((
            f"{band} {cat.capitalize()} Edicion Especial",
            f"Producto oficial de {band}. Calidad premium para fans del club.",
            f"https://laikaclub.mx/merch/{uuid.uuid4().hex[:8]}.jpg",
            1, cat, 1,
            round(random.uniform(3.5, 5.0), 1),
            "published",
            random_datetime(2023, 2025).isoformat()
        ))
    sql_items = """
        INSERT INTO merchandise_items
        (name, description, image_url, manager_id, category, is_official, rating, status, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql_items, item_records, desc="merch_items")

    cursor.execute("SELECT id FROM merchandise_items")
    item_ids = [r[0] for r in cursor.fetchall()]

    # ─── Variantes (~600) ─────────────────────────────────────────────────────
    variant_records = []
    for iid in item_ids:
        for _ in range(random.randint(2, 4)):
            price = round(random.uniform(150, 1800), 2)
            variant_records.append((
                iid, f"SKU-{uuid.uuid4().hex[:8].upper()}",
                random.choice(MERCH_SIZES), random.choice(MERCH_COLORS),
                price, random.randint(0, 500), 1,
                random_datetime(2023, 2025).isoformat()
            ))
    sql_vars = """
        INSERT INTO merchandise_variants
        (item_id, sku, size, color, price, stock, is_active, created_at)
        VALUES (?,?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql_vars, variant_records, desc="merch_variants")

    cursor.execute("SELECT id, price FROM merchandise_variants")
    variant_rows   = cursor.fetchall()
    variant_ids    = [r[0] for r in variant_rows]
    variant_prices = {r[0]: float(r[1]) for r in variant_rows}

    # ─── Ordenes (20,000) ─────────────────────────────────────────────────────
    order_records = []
    mongo_merch   = []

    for _ in range(n_orders):
        uid   = random.choice(user_ids)
        vid   = random.choice(variant_ids)
        qty   = random.randint(1, 5)
        price = variant_prices.get(vid, round(random.uniform(150, 1800), 2))
        total = round(price * qty, 2)
        comm  = round(total * 0.10, 2)
        net   = round(total - comm, 2)
        method= random.choice(PAYMENT_METHODS)
        dt    = random_datetime(2024, 2026)

        order_records.append((uid, total, comm, net, "completed", method, dt.isoformat()))
        mongo_merch.append({
            "user_id": uid, "total_amount": total, "commission": comm,
            "payment_method": method, "quantity": qty, "unit_price": price,
            "created_at": dt.isoformat(), "source": "seed_faker"
        })

    sql_orders = """
        INSERT INTO merchandise_orders
        (user_id, total_amount, total_commission, net_amount, status, payment_method, created_at)
        VALUES (?,?,?,?,?,?,?)
    """
    batch_insert(conn, sql_orders, order_records, desc="merch_orders")

    # order_items
    cursor.execute("SELECT id FROM merchandise_orders ORDER BY id DESC LIMIT ?", (n_orders,))
    real_order_ids = [r[0] for r in cursor.fetchall()]

    oi_records = []
    for oid in real_order_ids:
        vid   = random.choice(variant_ids)
        qty   = random.randint(1, 3)
        price = variant_prices.get(vid, 200.0)
        oi_records.append((oid, vid, qty, price))

    sql_oi = "INSERT INTO merchandise_order_items (order_id, variant_id, quantity, unit_price) VALUES (?,?,?,?)"
    batch_insert(conn, sql_oi, oi_records, desc="order_items")

    conn.close()
    return mongo_merch


# ══════════════════════════════════════════════════════════════════════════════
# 6. MONGODB ATLAS — sincronizacion
# ══════════════════════════════════════════════════════════════════════════════
def seed_mongodb(users_m, logs_m, events_m, tickets_m, merch_m):
    print(f"\n[6/6] Conectando a MongoDB Atlas...")
    if not MONGO_URI or len(MONGO_URI) < 20:
        print("    [!] MONGO_URI vacio. Saltando MongoDB Atlas.")
        return
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=12000)
        client.server_info()  # Forzar conexion
        db = client[MONGO_DB_NAME]
        print(f"    Conectado -> base: {MONGO_DB_NAME}")

        for col_name, data in [
            ("users",              users_m),
            ("auth_logs",          logs_m),
            ("events",             events_m),
            ("tickets",            tickets_m),
            ("merchandise_orders", merch_m),
        ]:
            if data:
                print(f"    -> {col_name} ({len(data)} docs)...")
                mongo_batch_insert(db[col_name], data, desc=col_name)

        client.close()
        print("    Atlas: COMPLETADO")
    except Exception as e:
        print(f"    [!] Error MongoDB Atlas: {e}")
        print("    [!] Los datos SQLite ya estan insertados correctamente.")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    print("=" * 62)
    print("  LAIKA CLUB — Inyeccion Masiva de Datos Ficticios")
    print("  Faker (es_MX) | SQLite x4 | MongoDB Atlas")
    print("=" * 62)
    start = datetime.now()

    # 1. Usuarios
    users_mongo, user_ids = seed_users(10000)
    if not user_ids:
        user_ids = list(range(1, 10001))

    # 2. Sesiones / Auth Logs
    logs_mongo = seed_auth_logs(user_ids, 50000)

    # 3. Eventos
    event_ids, events_mongo = seed_events(500)
    if not event_ids:
        event_ids = list(range(1, 501))

    # 4. Tickets + Pagos
    tickets_mongo = seed_tickets(user_ids, event_ids, 30000)

    # 5. Mercancia
    merch_mongo = seed_merchandise(user_ids, 20000)

    # 6. MongoDB Atlas
    seed_mongodb(users_mongo, logs_mongo, events_mongo, tickets_mongo, merch_mongo)

    # RESUMEN
    elapsed = datetime.now() - start
    mins, secs = elapsed.seconds // 60, elapsed.seconds % 60
    print("\n" + "=" * 62)
    print(f"  COMPLETADO en {mins}m {secs}s!")
    print("=" * 62)
    print("  DATOS INSERTADOS:")
    print(f"    Usuarios              -> 10,000")
    print(f"    Logs de sesion        -> 50,000")
    print(f"    Eventos/Escenarios    ->    500")
    print(f"    Secciones de boletos  -> ~1,500")
    print(f"    Tickets (ventas)      -> 30,000")
    print(f"    Pagos                 -> 30,000")
    print(f"    Productos merch       ->    200")
    print(f"    Variantes merch       ->   ~600")
    print(f"    Ordenes mercancia     -> 20,000")
    print(f"    Items de orden        -> 20,000")
    print(f"    MongoDB Atlas         -> Sincronizado")
    print("=" * 62)
    print("  El arbol de decision y Big Data tienen datos suficientes!")
    print("=" * 62)


if __name__ == "__main__":
    main()
