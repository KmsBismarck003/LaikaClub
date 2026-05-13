import os
import random
import uuid
import pymysql
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "")
DB_NAME = os.getenv("MYSQL_DATABASE", "laika_club")

def connect():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )

def main():
    conn = None
    try:
        conn = connect()
    except Exception as e:
        logging.error(f"Fallo conectando a MySQL: {e}")
        return

    cur = conn.cursor()
    
    # 1. 35,000 USERS
    logging.info("Generando 35,000 usuarios sinteticos para alcanzar base 50k...")
    users_data = []
    for i in range(35000):
        users_data.append((
            f"SynUser{i}", f"Data{i}", f"synthetic_{i}_{uuid.uuid4().hex[:8]}@sim.com",
            "active", "usuario", "hash_simulado"
        ))
    
    # Inserción en bloques (Batch insert para performance en disco local)
    batch_u = 5000
    for i in range(0, len(users_data), batch_u):
        cur.executemany("""
            INSERT INTO users (first_name, last_name, email, status, role, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, users_data[i:i+batch_u])
    logging.info("Usuarios creados con exito.")
    
    # Obtener listado de usuarios 
    cur.execute("SELECT id FROM users")
    all_users = [row['id'] for row in cur.fetchall()]
    
    # Elegir 10 ballenas (Super Fans)
    whales = random.sample(all_users, 10)
    logging.info(f"Ballenas (Súper Fans) seleccionadas IDs: {whales}")
    
    # 2. 640 EVENTS
    logging.info("Generando 640 Eventos con multiples categorias, estados y cancelaciones ruidosas...")
    categories = ['concert','sport','theater','festival','other']
    event_data = []
    
    now = datetime.now()
    for i in range(640):
        cat = random.choice(categories)
        days_offset = random.randint(-400, 400)
        edate = now + timedelta(days=days_offset)
        
        # Determine status (Injecting cancellations for tree risk model)
        status = 'published'
        cancel_reason = None
        cancelled_at = None
        if days_offset < 0:
            status = random.choices(['completed', 'cancelled'], weights=[80, 20])[0]
        else:
            status = random.choices(['published', 'cancelled'], weights=[85, 15])[0]
            
        if status == 'cancelled':
            cancel_reason = random.choice(["Baja taquilla critica", "Enfermedad artista", "Lluvia severa catastrofica", "Bancarrota tecnico", "Clima extremo"])
            cancelled_at = edate - timedelta(days=random.randint(1, 15))
            if cancelled_at > now: cancelled_at = now
            
        capacity = random.randint(300, 8000)
        base_price = round(random.uniform(20.0, 500.0), 2)
        
        event_data.append((
            f"Big Data Simulation {cat.capitalize()} {i}",
            cat, edate.strftime('%Y-%m-%d'), "20:00:00", f"Coliseo LAIKA {random.randint(1,50)}",
            base_price, capacity, capacity, status,
            random.choice(all_users), cancel_reason, cancelled_at
        ))
    
    cur.executemany("""
        INSERT INTO events (name, category, event_date, event_time, location, price, total_tickets, available_tickets, status, created_by, cancel_reason, cancelled_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, event_data)
    logging.info("Eventos generados.")
    
    cur.execute("SELECT id, status, price, event_date FROM events")
    all_events = cur.fetchall()
    
    # 3. COMPRAS MASIVAS Y BALLENAS
    logging.info("Generando boletaje transaccional matematico...")
    ticket_data = []
    batch_size = 15000
    total_tickets = 0
    
    for ev in all_events:
        ev_id = ev['id']
        ev_status = ev['status']
        base_price = float(ev['price'])
        
        # Ballenas compran 1 VIP a TODOS menos a los cancelados (Pattern detection for K-Means)
        if ev_status != 'cancelled':
            for w in whales:
                ticket_data.append((
                    f"WHL-{uuid.uuid4().hex[:14]}", ev_id, w, "vip", round(base_price*2.5, 2), "active"
                ))
        
        # Ruido y compras aleatorias
        num_buyers = random.randint(50, 400) 
        buyers = random.sample(all_users, num_buyers)
        
        for b in buyers:
            if b in whales: continue
            ttype = random.choices(['general', 'vip', 'early_bird'], weights=[70, 15, 15])[0]
            price = base_price
            if ttype == 'vip': price *= 2.5
            elif ttype == 'early_bird': price *= 0.8
            
            tstatus = 'active'
            if ev_status == 'cancelled':
                tstatus = 'refunded'
            elif ev_status == 'completed':
                tstatus = 'used'
            else:
                # 5% random anomaly refunds
                if random.random() < 0.05:
                    tstatus = 'refunded'
                    
            ticket_data.append((
                f"TCK-{uuid.uuid4().hex[:14]}", ev_id, b, ttype, round(price, 2), tstatus
            ))
            
            if len(ticket_data) >= batch_size:
                cur.executemany("""
                    INSERT IGNORE INTO tickets (ticket_code, event_id, user_id, ticket_type, price, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, ticket_data)
                total_tickets += len(ticket_data)
                ticket_data = []
                
    if len(ticket_data) > 0:
        cur.executemany("""
            INSERT IGNORE INTO tickets (ticket_code, event_id, user_id, ticket_type, price, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, ticket_data)
        total_tickets += len(ticket_data)
        
    logging.info(f"Inyeccion masiva completada: Se inyectaron {total_tickets} transacciones (tickets de compras).")
    conn.close()

if __name__ == "__main__":
    main()
