import sqlite3
import random
import uuid
import datetime
import os
from passlib.context import CryptContext

# Configuración de rutas
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTH_DB = os.path.join(BASE_DIR, "microservices/auth/auth.db")
EVENTS_DB = os.path.join(BASE_DIR, "microservices/events/events.db")
TICKETS_DB = os.path.join(BASE_DIR, "microservices/tickets/tickets.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Calculamos un único hash para todos los usuarios de prueba para ahorrar tiempo (15k hashes de bcrypt tardarían demasiado)
print("Calculando hash base...")
DEFAULT_HASH = pwd_context.hash("password123")
print("Hash base generado.")

FIRST_NAMES = ["Juan", "Maria", "Carlos", "Ana", "Pedro", "Lucia", "Diego", "Elena", "Luis", "Sofia", "Miguel", "Isabel", "Javier", "Carmen", "Fernando", "Rosa"]
LAST_NAMES = ["Garcia", "Rodriguez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Jimenez", "Ruiz", "Hernandez", "Diaz", "Moreno", "Muñoz"]

def populate():
    print("--- INICIANDO INYECCIÓN MASIVA DE DATOS ---")
    
    # 1. Crear usuarios nuevos (solo si faltan para llegar a ~25,000)
    auth_conn = sqlite3.connect(AUTH_DB)
    auth_cur = auth_conn.cursor()
    
    auth_cur.execute("SELECT COUNT(*) FROM users WHERE role='usuario'")
    current_count = auth_cur.fetchone()[0]
    
    if current_count < 24000:
        to_create = 24000 - current_count
        print(f"Usuarios actuales: {current_count}. Creando {to_create} más...")
        new_users = []
        for i in range(to_create):
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            email = f"user_mass_{uuid.uuid4().hex[:10]}@laikaclub.test"
            role = "usuario"
            status = "active"
            created_at = (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 180))).isoformat()
            new_users.append((fname, lname, email, DEFAULT_HASH, role, status, created_at))
            
        auth_cur.executemany("""
            INSERT INTO users (first_name, last_name, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, new_users)
        auth_conn.commit()
    
    auth_cur.execute("SELECT id FROM users WHERE role='usuario'")
    user_ids = [row[0] for row in auth_cur.fetchall()]
    auth_conn.close()

    events_conn = sqlite3.connect(EVENTS_DB)
    events_cur = events_conn.cursor()
    events_cur.execute("SELECT id, name, price FROM events WHERE status='published'")
    published_events = events_cur.fetchall()
    events_conn.close()

    if not published_events:
        print("Error: No hay eventos publicados para asignar boletos.")
        return

    # 3. Generar transacciones en tickets.db
    tickets_conn = sqlite3.connect(TICKETS_DB)
    tickets_cur = tickets_conn.cursor()

    print("Generando transacciones y boletos...")
    
    payments_batch = []
    tickets_batch = []
    
    # Usar un set para asegurar unicidad de códigos en este lote
    used_codes = set()
    tickets_cur.execute("SELECT ticket_code FROM tickets")
    for row in tickets_cur.fetchall():
        used_codes.add(row[0])

    reasons_failure = ["Fondos insuficientes", "Tarjeta rechazada", "3D Secure Fallido", "Fraude", "Timeout"]
    methods = ["Tarjeta Crdito", "PayPal", "Apple Pay"]

    for user_id in user_ids:
        # Menos boletos por usuario para no saturar demasiado
        num_purchases = random.choices([0, 1, 2], weights=[60, 30, 10])[0]
        
        for _ in range(num_purchases):
            event = random.choice(published_events)
            event_id, _, price = event
            
            is_success = random.random() < 0.85
            status = "completed" if is_success else "failed"
            reason = None if is_success else random.choice(reasons_failure)
            ref = f"REF-{uuid.uuid4().hex[:12].upper()}"
            created_at = (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 100))).isoformat()
            
            payments_batch.append((user_id, event_id, price, random.choice(methods), status, ref, reason, created_at))
            
            if is_success:
                while True:
                    ticket_code = f"LK-{uuid.uuid4().hex[:10].upper()}"
                    if ticket_code not in used_codes:
                        used_codes.add(ticket_code)
                        break
                
                qr_data = f"TICKET-{ticket_code}-{user_id}"
                ticket_status = "active"
                redeemed_at = None
                if random.random() < 0.4:
                    redeemed_at = (datetime.datetime.fromisoformat(created_at) + datetime.timedelta(hours=random.randint(24, 48))).isoformat()
                    ticket_status = "redeemed"
                
                tickets_batch.append((user_id, event_id, ticket_code, qr_data, "General", price, ticket_status, "Tarjeta", redeemed_at, created_at))

    print(f"Insertando {len(payments_batch)} pagos...")
    tickets_cur.executemany("INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, reason, created_at) VALUES (?,?,?,?,?,?,?,?)", payments_batch)
    
    print(f"Insertando {len(tickets_batch)} boletos...")
    tickets_cur.executemany("INSERT INTO tickets (user_id, event_id, ticket_code, qr_data, section_name, price, status, payment_method, redeemed_at, purchase_date) VALUES (?,?,?,?,?,?,?,?,?,?)", tickets_batch)

    tickets_conn.commit()
    tickets_conn.close()
    
    print("\n--- INYECCIÓN COMPLETADA ---")
    print(f"Usuarios procesados: {len(user_ids)}")
    print(f"Transacciones generadas: {len(payments_batch)}")
    print(f"Boletos activos/usados: {len(tickets_batch)}")

if __name__ == "__main__":
    populate()
