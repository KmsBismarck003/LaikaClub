import os
import sqlite3
import pymysql
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Cargar configuración
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

def get_mysql_conn():
    try:
        return pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            autocommit=True
        )
    except Exception as e:
        print(f"[ERROR] MySQL no disponible: {e}")
        return None

def get_sqlite_conn(db_path):
    full_path = BASE_DIR / db_path
    if full_path.exists():
        return sqlite3.connect(str(full_path))
    return None

def migrate_mysql_schema(cursor):
    print("  -> Verificando esquemas en MySQL...")
    
    # Migrar TICKETS
    cursor.execute("DESCRIBE tickets")
    cols_t = [col[0] for col in cursor.fetchall()]
    needed_t = {
        "qr_data": "TEXT",
        "section_name": "VARCHAR(100)",
        "seat_id": "VARCHAR(50)",
        "redeemed_at": "DATETIME",
        "payment_method": "VARCHAR(100)" # Cambiar de enum a varchar
    }
    for col, schema in needed_t.items():
        if col not in cols_t:
            cursor.execute(f"ALTER TABLE tickets ADD COLUMN {col} {schema}")
        elif col == "payment_method":
            cursor.execute("ALTER TABLE tickets MODIFY COLUMN payment_method VARCHAR(100)")

    # Migrar PAYMENTS
    cursor.execute("DESCRIBE payments")
    cols_p = [col[0] for col in cursor.fetchall()]
    if "reference" not in cols_p:
        cursor.execute("ALTER TABLE payments ADD COLUMN reference VARCHAR(255)")
    cursor.execute("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(100)")

def setup_mysql_refunds(cursor):
    print("  -> Asegurando tabla refund_requests en MySQL...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refund_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ticket_id INT NOT NULL,
            event_id INT,
            amount DECIMAL(10,2) NOT NULL,
            reason TEXT NOT NULL,
            detail TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

def inject_data_mysql(conn, user_id):
    print(f"\n[INJECT] Procesando MySQL (User ID: {user_id})...")
    cursor = conn.cursor()
    migrate_mysql_schema(cursor)
    setup_mysql_refunds(cursor)

    # 1. Usuario
    cursor.execute("UPDATE users SET first_name='Juan', last_name='Caballo' WHERE id=%s", (user_id,))

    # 2. Tickets
    tickets_data = [
        (user_id, 7, f"LK-RED-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO", "VIP", "B-12", 2500.0, "used", "tarjeta", (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d %H:%M:%S'), (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')),
        (user_id, 8, f"LK-ACT-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO2", "General", "GA-1", 1850.0, "active", "paypal", None, (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')),
        (user_id, 11, f"LK-ACT-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO3", "Preferente", "F-4", 950.0, "active", "efectivo", None, (datetime.now() - timedelta(hours=5)).strftime('%Y-%m-%d %H:%M:%S'))
    ]

    for t in tickets_data:
        cursor.execute("""
            INSERT INTO tickets 
            (user_id, event_id, ticket_code, qr_data, section_name, seat_id, price, status, payment_method, redeemed_at, purchase_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, t)
    
    cursor.execute("SELECT id FROM tickets WHERE user_id=%s AND event_id=8 ORDER BY id DESC LIMIT 1", (user_id,))
    ticket_id = cursor.fetchone()[0]

    # 3. Refunds
    refunds = [
        (user_id, ticket_id, 8, 1200.0, "Cambio de ciudad", "Juan no podrá asistir por viaje", "approved"),
        (user_id, ticket_id, 8, 850.0, "Error en duplicado", "Cargo doble reportado", "pending")
    ]
    for r in refunds:
        cursor.execute("INSERT INTO refund_requests (user_id, ticket_id, event_id, amount, reason, detail, status) VALUES (%s, %s, %s, %s, %s, %s, %s)", r)

    # 4. Payments
    payments = [
        (user_id, 7, 2500.0, "tarjeta", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}"),
        (user_id, 8, 1850.0, "paypal", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}"),
        (user_id, 11, 950.0, "efectivo", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}")
    ]
    for p in payments:
        cursor.execute("INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference) VALUES (%s, %s, %s, %s, %s, %s)", p)

    print("  [OK] MySQL inyectado.")

def inject_data_sqlite(tickets_conn, auth_conn, user_id):
    print(f"\n[INJECT] Procesando SQLite (User ID: {user_id})...")
    
    # Auth update
    if auth_conn:
        auth_conn.execute("UPDATE users SET first_name='Juan', last_name='Caballo' WHERE id=?", (user_id,))
        auth_conn.commit()
    
    # Tickets update
    if tickets_conn:
        cursor = tickets_conn.cursor()
        
        # Tickets
        tickets_data = [
            (user_id, 7, f"LK-RED-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO", "VIP", "B-12", 2500.0, "redeemed", "tarjeta", (datetime.now() - timedelta(days=5)).isoformat(), (datetime.now() - timedelta(days=30)).isoformat()),
            (user_id, 8, f"LK-ACT-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO2", "General", "GA-1", 1850.0, "active", "paypal", None, (datetime.now() - timedelta(days=2)).isoformat()),
            (user_id, 11, f"LK-ACT-{uuid.uuid4().hex[:6].upper()}", "QR:DEMO3", "Preferente", "F-4", 950.0, "active", "efectivo", None, (datetime.now() - timedelta(hours=5)).isoformat())
        ]
        for t in tickets_data:
            cursor.execute("INSERT INTO tickets (user_id, event_id, ticket_code, qr_data, section_name, seat_id, price, status, payment_method, redeemed_at, purchase_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)", t)
        
        cursor.execute("SELECT id FROM tickets WHERE user_id=? AND event_id=8 ORDER BY id DESC LIMIT 1", (user_id,))
        tid = cursor.fetchone()[0]
        
        # Refunds
        refunds = [
            (user_id, tid, 8, 1200.0, "Cambio de ciudad", "Juan no podrá asistir por viaje", "approved"),
            (user_id, tid, 8, 850.0, "Error en duplicado", "Cargo doble reportado", "pending")
        ]
        for r in refunds:
            cursor.execute("INSERT INTO refund_requests (user_id, ticket_id, event_id, amount, reason, detail, status) VALUES (?,?,?,?,?,?,?)", r)
        
        # Payments
        payments = [
            (user_id, 7, 2500.0, "tarjeta", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}"),
            (user_id, 8, 1850.0, "paypal", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}"),
            (user_id, 11, 950.0, "efectivo", "completed", f"REF-{uuid.uuid4().hex[:8].upper()}")
        ]
        for p in payments:
            cursor.execute("INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference) VALUES (?,?,?,?,?,?)", p)
        
        tickets_conn.commit()
    print("  [OK] SQLite inyectado.")

def main():
    # 1. MySQL
    conn_mysql = get_mysql_conn()
    if conn_mysql:
        try:
            inject_data_mysql(conn_mysql, 9)
            conn_mysql.close()
        except Exception as e:
            print(f"[ERROR] MySQL: {e}")

    # 2. SQLite
    conn_tickets = get_sqlite_conn("microservices/tickets/tickets.db")
    conn_auth = get_sqlite_conn("microservices/auth/auth.db")
    if conn_tickets or conn_auth:
        try:
            inject_data_sqlite(conn_tickets, conn_auth, 4)
            if conn_tickets: conn_tickets.close()
            if conn_auth: conn_auth.close()
        except Exception as e:
            print(f"[ERROR] SQLite: {e}")

if __name__ == "__main__":
    main()
