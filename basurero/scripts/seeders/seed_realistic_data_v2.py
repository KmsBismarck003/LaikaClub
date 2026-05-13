import os
import sys
import random
import uuid
from datetime import datetime
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from faker import Faker

# Configurar Faker y Hashing
fake = Faker('es_MX')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configurar Conexión
DB_URL = "mysql+pymysql://root:@localhost/laika_club3"
engine = create_engine(DB_URL)

def run_seed():
    with engine.begin() as conn:
        print("[*] Vaciando datos anteriores...")
        # Para evitar problemas de foreign keys, eliminamos en orden (ignorando si no existen)
        tables_to_clear = ["tickets", "payments", "event_ticket_sections", "refund_requests", "user_achievements", "user_coupons", "events", "users"]
        for t in tables_to_clear:
            try:
                if t == "users":
                    conn.execute(text(f"DELETE FROM {t} WHERE role != 'admin'"))
                else:
                    conn.execute(text(f"DELETE FROM {t}"))
            except Exception as e:
                pass

        # ==========================================
        # 1. CREACIÓN DE USUARIOS
        # ==========================================
        print("\n[*] Generando hash de contraseñas...")
        hash_users = pwd_context.hash("user123")
        hash_managers = pwd_context.hash("gestor123")
        hash_bismarck = pwd_context.hash("gearsof2")

        print("[*] Creando 6 Gestores y usuario Kms Bismarck...")
        users_to_insert = []
        
        # Gestores
        for i in range(1, 7):
            users_to_insert.append({
                "first_name": "Gestor",
                "last_name": f"Laika {i}",
                "email": f"gestor{i}@laika.club",
                "password_hash": hash_managers,
                "role": "gestor",
                "created_at": datetime.now()
            })
            
        # Bismarck
        users_to_insert.append({
            "first_name": "Kms",
            "last_name": "Bismarck",
            "email": "redjar481@gmail.com",
            "password_hash": hash_bismarck,
            "role": "usuario",
            "created_at": datetime.now()
        })
        
        # Insertar gestores y Bismarck rápido
        conn.execute(text("""
            INSERT INTO users (first_name, last_name, email, password_hash, role, created_at)
            VALUES (:first_name, :last_name, :email, :password_hash, :role, :created_at)
        """), users_to_insert)

        print("[*] Creando 10,000 Usuarios (esto puede tomar un minuto)...")
        batch_users = []
        for _ in range(10000):
            batch_users.append({
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "email": fake.unique.email(),
                "password_hash": hash_users,
                "role": "usuario",
                "created_at": fake.date_time_between(start_date='-1y', end_date='now')
            })
            
            # Insertar en lotes de 2000 para no saturar la RAM
            if len(batch_users) == 2000:
                conn.execute(text("""
                    INSERT INTO users (first_name, last_name, email, password_hash, role, created_at)
                    VALUES (:first_name, :last_name, :email, :password_hash, :role, :created_at)
                """), batch_users)
                batch_users = []

        # ==========================================
        # OBTENER IDs
        # ==========================================
        result = conn.execute(text("SELECT id, role, email FROM users"))
        all_db_users = result.fetchall()
        
        manager_ids = [r.id for r in all_db_users if r.role == 'gestor']
        bismarck_id = next(r.id for r in all_db_users if r.email == 'redjar481@gmail.com')
        regular_user_ids = [r.id for r in all_db_users if r.role == 'usuario']

        print(f"  -> {len(regular_user_ids)} usuarios cargados (incluyendo Bismarck).")

        # ==========================================
        # 2. CREACIÓN DE EVENTOS
        # ==========================================
        print("\n[*] Generando 60 Eventos y sus secciones...")
        categories = ["Concierto", "Deporte", "Teatro", "Festival", "Convencion", "Evento Especial"]
        venues = [
            {"id": 1, "name": "Laika Arena Virtual", "cap": 50000},
            {"id": 2, "name": "Foro Sol Laika", "cap": 60000},
            {"id": 3, "name": "Teatro Laika", "cap": 3000},
            {"id": 4, "name": "Estadio Laika", "cap": 80000}
        ]

        event_ids_created = []

        for i in range(1, 61):
            mgr_id = random.choice(manager_ids)
            cat_name = random.choice(categories)
            venue = random.choice(venues)
            
            e_date = fake.date_time_between(start_date='-2m', end_date='+6m')
            total_cap = random.randint(1000, 10000)
            
            try:
                res = conn.execute(text("""
                    INSERT INTO events (name, description, category, event_date, event_time, venue, venue_id, image_url, created_by, status, available_tickets, total_tickets)
                    VALUES (:name, :desc, :cat, :date, '20:00:00', :vname, :vid, :img, :cb, 'publicado', :cap, :cap)
                """), {
                    "name": fake.catch_phrase().title(),
                    "desc": fake.paragraph(nb_sentences=3),
                    "cat": cat_name,
                    "date": e_date.date(),
                    "vname": venue["name"],
                    "vid": venue["id"],
                    "img": "https://picsum.photos/800/400?random=" + str(i),
                    "cb": mgr_id,
                    "cap": total_cap
                })
                    
                e_id = res.lastrowid
                event_ids_created.append((e_id, total_cap))

                # Crear secciones para este evento
                vips = random.randint(100, 500)
                gold = random.randint(300, 1000)
                gen = total_cap - vips - gold

                conn.execute(text("""
                    INSERT INTO event_ticket_sections (event_id, name, capacity, price, available)
                    VALUES 
                    (:eid, 'VIP', :vips, :p_vip, :vips),
                    (:eid, 'GOLD', :gold, :p_gold, :gold),
                    (:eid, 'GENERAL', :gen, :p_gen, :gen)
                """), {
                    "eid": e_id,
                    "vips": vips, "p_vip": random.randint(1500, 3000),
                    "gold": gold, "p_gold": random.randint(800, 1499),
                    "gen": gen,   "p_gen": random.randint(300, 799)
                })
            except Exception as ev_err:
                print(f"Error evento {i}: {ev_err}")

        # ==========================================
        # 3. TICKETS PARA BISMARCK
        # ==========================================
        print("\n[*] Comprando boletos para Kms Bismarck...")
        bismarck_tickets = []
        bismarck_payments = []
        
        # Guardaremos el mapping de precio por sección para que todos cuadren
        
        for e_id, cap in event_ids_created:
            b_code = f"TKT-{uuid.uuid4().hex[:12].upper()}"
            p_ref = f"PAY-{uuid.uuid4().hex[:12].upper()}"
            price = 1500.0
            
            bismarck_tickets.append({
                "uid": bismarck_id, "eid": e_id, "code": b_code, 
                "status": "active", "pd": datetime.now(), 
                "ttype": "VIP", "price": price
            })
            bismarck_payments.append({
                "uid": bismarck_id, "eid": e_id, "amt": price, 
                "pm": "credit_card", "status": "completed", "ref": p_ref, "ca": datetime.now()
            })
            
        conn.execute(text("""
            INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, ticket_type, price)
            VALUES (:uid, :eid, :code, :status, :pd, :ttype, :price)
        """), bismarck_tickets)
        
        conn.execute(text("""
            INSERT INTO payments (user_id, event_id, amount, payment_method, transaction_id, status, payment_date)
            VALUES (:uid, :eid, :amt, :pm, :ref, :status, :ca)
        """), bismarck_payments)

        # ==========================================
        # 4. SIMULAR VENTAS MASIVAS A LOS 10K USUARIOS
        # ==========================================
        print("[*] Simulando ventas masivas realistas a la población de usuarios...")
        mass_tickets = []
        mass_payments = []
        
        for e_id, cap in event_ids_created:
            num_buyers = random.randint(50, min(500, cap)) # Ajuste para no colgarse
            buyers = random.sample(regular_user_ids, num_buyers)
            
            for b_id in buyers:
                code = f"TKT-{uuid.uuid4().hex[:12].upper()}"
                ref = f"PAY-{uuid.uuid4().hex[:12].upper()}"
                p = random.choice([400.0, 900.0, 1800.0])
                section = "GENERAL" if p == 400.0 else ("GOLD" if p == 900.0 else "VIP")
                
                dt_buy = fake.date_time_between(start_date='-1m', end_date='now')
                mass_tickets.append({
                    "uid": b_id, "eid": e_id, "code": code, 
                    "status": "active", "pd": dt_buy,
                    "ttype": section, "price": p
                })
                
                mass_payments.append({
                    "uid": b_id, "eid": e_id, "amt": p, 
                    "pm": random.choice(["credit_card", "paypal", "oxxo"]), 
                    "status": "completed", "ref": ref, 
                    "ca": dt_buy
                })
                
                # Insertar en lotes
                if len(mass_tickets) >= 2000:
                    conn.execute(text("""
                        INSERT INTO tickets (ticket_code, event_id, user_id, ticket_type, price, purchase_date, status)
                        VALUES (:code, :eid, :uid, :ttype, :price, :pd, :status)
                    """), mass_tickets)
                    conn.execute(text("""
                        INSERT INTO payments (user_id, event_id, amount, payment_method, transaction_id, status, payment_date)
                        VALUES (:uid, :eid, :amt, :pm, :ref, :status, :ca)
                    """), mass_payments)
                    mass_tickets.clear()
                    mass_payments.clear()

        # Insertar remanentes
        if mass_tickets:
            conn.execute(text("""
                INSERT INTO tickets (ticket_code, event_id, user_id, ticket_type, price, purchase_date, status)
                VALUES (:code, :eid, :uid, :ttype, :price, :pd, :status)
            """), mass_tickets)
            conn.execute(text("""
                INSERT INTO payments (user_id, event_id, amount, payment_method, transaction_id, status, payment_date)
                VALUES (:uid, :eid, :amt, :pm, :ref, :status, :ca)
            """), mass_payments)

        # Atualizar los available_tickets
        print("[*] Actualizando contadores de asientos disponibles...")
        conn.execute(text("""
            UPDATE event_ticket_sections ets
            JOIN (
                SELECT event_id, ticket_type, COUNT(*) as sold 
                FROM tickets 
                WHERE status IN ('active', 'used') 
                GROUP BY event_id, ticket_type
            ) t ON ets.event_id = t.event_id AND ets.name COLLATE utf8mb4_unicode_ci = t.ticket_type COLLATE utf8mb4_unicode_ci
            SET ets.available = ets.capacity - t.sold
        """))
        
        conn.execute(text("""
            UPDATE events e
            JOIN (
                SELECT event_id, COUNT(*) as sold 
                FROM tickets 
                WHERE status IN ('active', 'used') 
                GROUP BY event_id
            ) t ON e.id = t.event_id
            SET e.available_tickets = e.total_tickets - t.sold
        """))

        print("\n[OK] SIEMBRA DE DATOS FINALIZADA CON ÉXITO")

if __name__ == '__main__':
    try:
        run_seed()
    except Exception as e:
        print(f"Error crítico: {e}")
