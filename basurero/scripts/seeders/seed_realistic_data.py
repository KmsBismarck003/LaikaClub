import os
import sys
import random
import uuid
import time
from datetime import datetime, timedelta
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
        print("[*] Vaciando datos anteriores (excepto tablas maestras necesarias)...")
        # Para evitar problemas de foreign keys, eliminamos en orden
        try:
            conn.execute(text("DELETE FROM tickets"))
            conn.execute(text("DELETE FROM payments"))
            conn.execute(text("DELETE FROM event_ticket_sections"))
            conn.execute(text("DELETE FROM refund_requests"))
            conn.execute(text("DELETE FROM user_achievements"))
            conn.execute(text("DELETE FROM user_coupons"))
            conn.execute(text("DELETE FROM events"))
            conn.execute(text("DELETE FROM users WHERE role != 'admin'")) # Dejar el super admin
        except Exception as e:
            print(f"Aviso durante DELETE: {e}")

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
                "name": f"Gestor Laika {i}",
                "email": f"gestor{i}@laika.club",
                "password_hash": hash_managers,
                "role": "gestor",
                "created_at": datetime.now()
            })
            
        # Bismarck
        users_to_insert.append({
            "name": "Kms Bismarck",
            "email": "redjar481@gmail.com",
            "password_hash": hash_bismarck,
            "role": "user",
            "created_at": datetime.now()
        })
        
        # Insertar gestores y Bismarck rápido
        conn.execute(text("""
            INSERT INTO users (name, email, password_hash, role, created_at)
            VALUES (:name, :email, :password_hash, :role, :created_at)
        """), users_to_insert)

        print("[*] Creando 10,000 Usuarios (esto puede tomar varios segundos)...")
        batch_users = []
        for _ in range(10000):
            batch_users.append({
                "name": fake.name(),
                "email": fake.unique.email(),
                "password_hash": hash_users,
                "role": "user",
                "created_at": fake.date_time_between(start_date='-1y', end_date='now')
            })
            
            # Insertar en lotes de 1000 para no saturar la RAM
            if len(batch_users) == 1000:
                conn.execute(text("""
                    INSERT INTO users (name, email, password_hash, role, created_at)
                    VALUES (:name, :email, :password_hash, :role, :created_at)
                """), batch_users)
                batch_users = []

        # ==========================================
        # OBTENER IDs
        # ==========================================
        # Recuperar IDs
        result = conn.execute(text("SELECT id, role, email FROM users"))
        all_db_users = result.fetchall()
        
        manager_ids = [r.id for r in all_db_users if r.role == 'gestor']
        bismarck_id = next(r.id for r in all_db_users if r.email == 'redjar481@gmail.com')
        regular_user_ids = [r.id for r in all_db_users if r.role == 'user'] # Incluye a bismarck pero no importa

        print(f"  -> {len(regular_user_ids)} usuarios cargados (incluyendo Bismarck).")
        print(f"  -> {len(manager_ids)} gestores.")

        # ==========================================
        # 2. CREACIÓN DE EVENTOS
        # ==========================================
        print("\n[*] Generando 60 Eventos y sus secciones...")
        categories = [
            ("Concierto", "🎶"),
            ("Deporte", "⚽"),
            ("Teatro", "🎭"),
            ("Festival", "🎪"),
            ("Otro", "✨")
        ]
        
        venues = [
            {"id": 1, "name": "Laika Arena Virtual", "cap": 50000},
            {"id": 2, "name": "Foro Sol Laika", "cap": 60000},
            {"id": 3, "name": "Teatro Laika Metropolitano", "cap": 3000},
            {"id": 4, "name": "Estadio Laika", "cap": 80000}
        ]

        # Necesitamos saber si existe tabla categories o category_id
        # Algunos esquemas de Laika tienen category (varchar) o category_id (int)
        # Vamos a inspeccionar la tabla:
        has_category_col = False
        try:
            conn.execute(text("SELECT category FROM events LIMIT 1"))
            has_category_col = True
        except:
            has_category_col = False

        event_ids_created = []

        for i in range(1, 61):
            mgr_id = random.choice(manager_ids)
            cat_name, cat_emoji = random.choice(categories)
            venue = random.choice(venues)
            
            e_date = fake.date_time_between(start_date='-2m', end_date='+6m')
            total_cap = random.randint(1000, 10000)
            
            # Insertar Evento
            # Intenta insertar asumiendo category como varchar
            if has_category_col:
                res = conn.execute(text("""
                    INSERT INTO events (name, description, category, event_date, venue_id, image_url, created_by, status, available_tickets)
                    VALUES (:name, :desc, :cat, :date, :vid, :img, :cb, 'published', :cap)
                """), {
                    "name": f"{cat_emoji} {fake.catch_phrase().title()}",
                    "desc": fake.paragraph(nb_sentences=3),
                    "cat": cat_name,
                    "date": e_date,
                    "vid": venue["id"],
                    "img": "https://picsum.photos/800/400?random=" + str(i),
                    "cb": mgr_id,
                    "cap": total_cap
                })
            else:
                cat_id = 1 # Fallback
                res = conn.execute(text("""
                    INSERT INTO events (name, description, category_id, event_date, venue_id, image_url, created_by, status, available_tickets)
                    VALUES (:name, :desc, :cat, :date, :vid, :img, :cb, 'published', :cap)
                """), {
                    "name": f"{cat_emoji} {fake.catch_phrase().title()}",
                    "desc": fake.paragraph(nb_sentences=3),
                    "cat": cat_id,
                    "date": e_date,
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
                INSERT INTO event_ticket_sections (event_id, name, capacity, price, available_tickets)
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

        # ==========================================
        # 3. TICKETS PARA BISMARCK (Para todos los eventos)
        # ==========================================
        print("\n[*] Comprando boletos de todos los eventos para Kms Bismarck...")
        bismarck_tickets = []
        bismarck_payments = []
        
        for e_id, cap in event_ids_created:
            b_code = f"TKT-{uuid.uuid4().hex[:8].upper()}"
            p_ref = f"PAY-{uuid.uuid4().hex[:6].upper()}"
            price = 1500.0
            
            bismarck_tickets.append({
                "uid": bismarck_id, "eid": e_id, "code": b_code, 
                "status": "active", "pd": datetime.now(), "seat": "VIP-A-1",
                "sec": "VIP", "price": price, "pm": "card"
            })
            bismarck_payments.append({
                "uid": bismarck_id, "eid": e_id, "amt": price, 
                "pm": "card", "status": "completed", "ref": p_ref, "ca": datetime.now()
            })
            
        conn.execute(text("""
            INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, seat_id, section_name, price, payment_method)
            VALUES (:uid, :eid, :code, :status, :pd, :seat, :sec, :price, :pm)
        """), bismarck_tickets)
        
        conn.execute(text("""
            INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, created_at)
            VALUES (:uid, :eid, :amt, :pm, :status, :ref, :ca)
        """), bismarck_payments)

        # ==========================================
        # 4. SIMULAR VENTAS MASIVAS A LOS 10K USUARIOS
        # ==========================================
        print("[*] Simulando ventas masivas realistas a la población de usuarios...")
        mass_tickets = []
        mass_payments = []
        
        for e_id, cap in event_ids_created:
            # Seleccionar entre 50 y 300 compradores por evento
            num_buyers = random.randint(50, min(300, cap))
            buyers = random.sample(regular_user_ids, num_buyers)
            
            for b_id in buyers:
                code = f"TKT-{uuid.uuid4().hex[:8].upper()}"
                ref = f"PAY-{uuid.uuid4().hex[:6].upper()}"
                p = random.choice([400.0, 900.0, 1800.0])
                section = "GENERAL" if p == 400.0 else ("GOLD" if p == 900.0 else "VIP")
                
                mass_tickets.append({
                    "uid": b_id, "eid": e_id, "code": code, 
                    "status": "active", "pd": fake.date_time_between(start_date='-1m', end_date='now'),
                    "seat": f"{section}-{random.randint(1,10)}-{random.randint(1,20)}",
                    "sec": section, "price": p, "pm": random.choice(["card", "paypal", "oxxo"])
                })
                
                mass_payments.append({
                    "uid": b_id, "eid": e_id, "amt": p, 
                    "pm": "card", "status": "completed", "ref": ref, 
                    "ca": fake.date_time_between(start_date='-1m', end_date='now')
                })
                
                # Insertar en lotes
                if len(mass_tickets) >= 2000:
                    conn.execute(text("""
                        INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, seat_id, section_name, price, payment_method)
                        VALUES (:uid, :eid, :code, :status, :pd, :seat, :sec, :price, :pm)
                    """), mass_tickets)
                    conn.execute(text("""
                        INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, created_at)
                        VALUES (:uid, :eid, :amt, :pm, :status, :ref, :ca)
                    """), mass_payments)
                    mass_tickets.clear()
                    mass_payments.clear()

        # Insertar los remanentes
        if mass_tickets:
            conn.execute(text("""
                INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, seat_id, section_name, price, payment_method)
                VALUES (:uid, :eid, :code, :status, :pd, :seat, :sec, :price, :pm)
            """), mass_tickets)
            conn.execute(text("""
                INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, created_at)
                VALUES (:uid, :eid, :amt, :pm, :status, :ref, :ca)
            """), mass_payments)

        # Atualizar los available_tickets restando lo vendido
        print("[*] Actualizando contadores de asientos disponibles en la BD...")
        conn.execute(text("""
            UPDATE event_ticket_sections ets
            JOIN (
                SELECT event_id, section_name, COUNT(*) as sold 
                FROM tickets 
                WHERE status IN ('active', 'used') 
                GROUP BY event_id, section_name
            ) t ON ets.event_id = t.event_id AND ets.name = t.section_name
            SET ets.available_tickets = ets.capacity - t.sold
        """))
        
        conn.execute(text("""
            UPDATE events e
            JOIN (
                SELECT event_id, COUNT(*) as sold 
                FROM tickets 
                WHERE status IN ('active', 'used') 
                GROUP BY event_id
            ) t ON e.id = t.event_id
            SET e.available_tickets = e.available_tickets - t.sold
        """))

        print("\n[OK] SIEMBRA DE DATOS FINALIZADA CON ÉXITO")

if __name__ == '__main__':
    try:
        run_seed()
    except Exception as e:
        print(f"Error crítico: {e}")
