import os
import re
import uuid
import random
import pymysql
from datetime import datetime, timedelta

# ==========================================
# SEED TRANSACTIONS SCRIPT - LAIKA CLUB
# ==========================================

# 1. Name Pools for Realistic Mexican Spanish Names
first_names_male = [
    "Juan", "Carlos", "José", "Luis", "Francisco", "Antonio", "Alejandro", "Manuel", "Roberto", "Mario",
    "Jorge", "Miguel", "Ángel", "Jesús", "Pedro", "Fernando", "Daniel", "David", "Arturo", "Sergio",
    "Ricardo", "Eduardo", "Javier", "Enrique", "Emilio", "Héctor", "Hugo", "Oscar", "Raúl", "Julio",
    "César", "Alberto", "Alfredo", "Gerardo", "Adrián", "Gustavo", "Jaime", "Mauricio", "Rodolfo", "Salvador",
    "Esteban", "Vicente", "Rogelio", "Armando", "Felipe", "Ignacio", "René", "Marcos", "Andrés", "Santiago"
]

first_names_female = [
    "María", "Guadalupe", "Juana", "Margarita", "Ana", "Leticia", "Silvia", "Elena", "Patricia", "Teresa",
    "Sandra", "Gabriela", "Martha", "Sofía", "Valentina", "Isabella", "Camila", "Victoria", "Natalia", "Andrea",
    "Daniela", "Mónica", "Adriana", "Beatriz", "Clara", "Gloria", "Laura", "Luisa", "Yolanda", "Rosa",
    "Irene", "Carmen", "Alicia", "Teresa", "Cecilia", "Alejandra", "Verónica", "Josefina", "Patricia", "Rocío",
    "Estela", "Karla", "Diana", "Lorena", "Claudia", "Paola", "Regina", "Jimena", "Renata", "Fernanda"
]

last_names = [
    "Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz",
    "Flores", "Gómez", "Díaz", "Morales", "Reyes", "Ortiz", "Gutiérrez", "Ruiz", "Chávez", "Vásquez",
    "Ramos", "Herrera", "Medina", "Vargas", "Castro", "Guzmán", "Muñoz", "Rojas", "Salazar", "Luna",
    "Ortega", "Guerrero", "Estrada", "Alvarado", "Delgado", "Espinoza", "Soto", "Mendoza", "Rivera", "Medrano",
    "Castillo", "Jiménez", "Juárez", "Pacheco", "Navarro", "Cabrera", "Miranda", "Acosta", "Trejo", "Valdez",
    "Mejía", "Ríos", "Becerra", "Robles", "Cervantes", "Cardona", "Maldonado", "Garza", "Villarreal", "Cárdenas",
    "Ochoa", "Vela", "Beltrán", "Rangel", "Salas", "Escobar", "Zúñiga", "Guerra", "Solís", "Arellano",
    "Valenzuela", "Tejeda", "Cano", "Mora", "Montes", "Figueroa", "Cordero", "Tapia", "Rendon", "Lara"
]

# 2. Email Nickname Pool
nouns = ["perro", "gato", "lobo", "taco", "chela", "elote", "chilaquil", "pan", "nacho", "charro", "nopal", "mezcal", "tequila", "ajolote", "churro", "esquite", "axolote", "brayan", "kevin", "chuy", "pepe"]
adjs = ["cachon", "chido", "loco", "feliz", "triste", "mago", "vago", "pro", "crack", "rapido", "gamer", "oscuro", "salvaje", "chacal", "malandro", "fifas", "otaku", "belico"]

# 3. Pre-calculated password hash for 'laika2026'
BCRYPT_HASH = "$2b$12$skRdiCz8i2nf5qi4IxK57.QDoLXDpWlp42YWTvyNgx6TiePNYGN.."

def load_env():
    env_vars = {}
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    env_vars[key] = value
    return env_vars

def clean_string(s):
    s = s.lower()
    s = re.sub(r'[áäâà]', 'a', s)
    s = re.sub(r'[éëêè]', 'e', s)
    s = re.sub(r'[íïîì]', 'i', s)
    s = re.sub(r'[óöôò]', 'o', s)
    s = re.sub(r'[úüûù]', 'u', s)
    s = re.sub(r'[ñ]', 'n', s)
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s

def generate_random_person(existing_emails):
    is_male = random.random() < 0.5
    first = random.choice(first_names_male) if is_male else random.choice(first_names_female)
    
    if random.random() < 0.7:
        last = f"{random.choice(last_names)} {random.choice(last_names)}"
    else:
        last = random.choice(last_names)

    clean_first = clean_string(first.split()[0])
    clean_last = clean_string(last.split()[0])
    
    email = ""
    while not email or email in existing_emails:
        pattern = random.choices([1, 2, 3, 4], weights=[40, 20, 20, 20])[0]
        if pattern == 1:
            num = random.randint(10, 9999)
            email = f"{clean_first}.{clean_last}{num}@gmail.com"
        elif pattern == 2:
            num = random.randint(10, 99)
            email = f"{clean_first}_{clean_last}{num}@gmail.com"
        elif pattern == 3:
            num = random.randint(10, 999)
            email = f"{random.choice(nouns)}{random.choice(adjs)}{num}@gmail.com"
        else:
            email = f"{random.choice(nouns)}_{random.choice(adjs)}@gmail.com"
            # If still exists, append a number
            if email in existing_emails:
                email = email.replace("@gmail.com", f"{random.randint(1, 99)}@gmail.com")
            
    existing_emails.add(email)
    
    area = random.choice(["55", "81", "33", "44", "77", "99", "66", "87"])
    digits = "".join(str(random.randint(0, 9)) for _ in range(8))
    phone = f"{area}{digits}"
    
    return first, last, email, phone

def generate_seats_for_section(section_id, capacity):
    seats = []
    seats_per_row = 30
    if capacity > 1000:
        seats_per_row = 50
    elif capacity > 5000:
        seats_per_row = 100
        
    row_num = 0
    while len(seats) < capacity:
        if row_num < 26:
            row_letter = chr(65 + row_num)
        else:
            row_letter = chr(65 + (row_num // 26) - 1) + chr(65 + (row_num % 26))
            
        for seat_num in range(1, seats_per_row + 1):
            if len(seats) >= capacity:
                break
            seat_id = f"{section_id}-{row_letter}-{seat_num}"
            seats.append(seat_id)
        row_num += 1
    return seats

def determine_ticket_type(section_name):
    name_lower = section_name.lower()
    if "vip" in name_lower or "paddock" in name_lower:
        return "vip"
    elif "early" in name_lower or "preventa" in name_lower:
        return "early_bird"
    else:
        return "general"

def main():
    print("=== LAIKA CLUB TRANSACTION DATA SEEDER ===")
    env = load_env()
    
    db_host = env.get("MYSQL_HOST", "localhost")
    db_user = env.get("MYSQL_USER", "root")
    db_name = env.get("MYSQL_DATABASE", "laika_club3_v2")
    
    # Try multiple passwords to handle Docker / XAMPP differences
    passwords_to_try = []
    env_pass = env.get("MYSQL_PASSWORD")
    if env_pass is not None:
        passwords_to_try.append(env_pass)
    for p in ["root", ""]:
        if p not in passwords_to_try:
            passwords_to_try.append(p)
            
    conn = None
    for pwd in passwords_to_try:
        print(f"Connecting to MySQL: {db_host} @ {db_name} with password: '{pwd}'")
        try:
            conn = pymysql.connect(
                host=db_host,
                user=db_user,
                password=pwd,
                database=db_name,
                charset="utf8mb4"
            )
            print("Connected successfully!")
            break
        except Exception as e:
            print(f"Failed to connect: {e}")
            
    if not conn:
        print("Error: Could not connect to MySQL with any password.")
        return
        
    cur = conn.cursor()
    
    # 4. Cleanup old users, tickets, payments
    print("Cleaning up old test users, tickets, and payments...")
    try:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        cur.execute("TRUNCATE TABLE tickets")
        cur.execute("TRUNCATE TABLE payments")
        cur.execute("DELETE FROM users WHERE role = 'usuario'")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()
        print("Cleanup completed successfully.")
    except Exception as e:
        print(f"Cleanup error: {e}. Proceeding...")
        conn.rollback()
        
    # 5. Fetch existing users to ensure email uniqueness
    cur.execute("SELECT email FROM users")
    existing_emails = set(row[0] for row in cur.fetchall())
    
    # Get current max ID in users (in case there are non-usuario accounts)
    cur.execute("SELECT MAX(id) FROM users")
    max_user_id = cur.fetchone()[0] or 0
    print(f"Current max user ID: {max_user_id}")
    
    # 6. Generate 30,000 normal users
    print("Generating 30,000 realistic normal users...")
    users_to_insert = []
    for i in range(30000):
        first, last, email, phone = generate_random_person(existing_emails)
        # birth_date: random age between 18 and 60
        age_days = random.randint(18*365, 60*365)
        birth_date = (datetime.now() - timedelta(days=age_days)).strftime("%Y-%m-%d")
        
        users_to_insert.append((
            first, last, email, phone, BCRYPT_HASH, "usuario", "active", "standard", birth_date
        ))
        
    print("Inserting users in MySQL in batches of 5000...")
    batch_size = 5000
    for i in range(0, len(users_to_insert), batch_size):
        cur.executemany("""
            INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status, subscription_tier, birth_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, users_to_insert[i:i+batch_size])
        conn.commit()
        print(f"  Inserted users {i} to {min(i+batch_size, len(users_to_insert))}...")
        
    # Fetch newly created user IDs
    cur.execute(f"SELECT id FROM users WHERE id > {max_user_id} AND role = 'usuario' ORDER BY id ASC")
    user_ids = [row[0] for row in cur.fetchall()]
    print(f"Verified {len(user_ids)} users generated and fetched.")
    
    if len(user_ids) < 30000:
        print("Warning: Generated fewer users than 30k. Will continue with what is available.")
        
    # 7. Fetch events, functions, and sections from DB
    cur.execute("SELECT id, name, total_tickets FROM events")
    db_events = cur.fetchall()
    
    event_id_map = {}
    for db_id, db_name, total_tickets in db_events:
        event_id_map[db_name] = {"id": db_id, "total_tickets": total_tickets}
        
    print("Events found in DB:")
    for name, data in event_id_map.items():
        print(f"  {name}: ID {data['id']}, Tickets {data['total_tickets']}")
        
    # Target sales percentage by event name
    targets_by_name = {
        "Afterlife México 2026": 0.95,
        "Vive Latino 2026": 0.92,
        "Rammstein: Zeit Tour 2026": 0.95,
        "Fórmula 1 Gran Premio de México 2026": 0.90,
        "Avengers: Endgame (Función Especial)": 0.60,
        "Cine Club: Joyas de la Animación": 0.40,
        "Michael Jackson Sinfónico": 0.75,
        "Festival de Rock Urbano": 0.80,
        "Concierto Especial de Otoño: Noviembre 4": 0.55
    }
    
    # 8. Fetch sections and functions per event
    sections_by_event = {}
    functions_by_event = {}
    
    for name, target_pct in targets_by_name.items():
        if name not in event_id_map:
            print(f"Warning: Custom event '{name}' not found in events table. Skipping.")
            continue
            
        ev_id = event_id_map[name]["id"]
        
        # Get sections
        cur.execute("SELECT id, name, price, capacity FROM event_ticket_sections WHERE event_id = %s", (ev_id,))
        sections = cur.fetchall()
        sections_by_event[ev_id] = [
            {"id": row[0], "name": row[1], "price": float(row[2]), "capacity": int(row[3])} for row in sections
        ]
        
        # Get functions
        cur.execute("SELECT id, date, time FROM event_functions WHERE event_id = %s", (ev_id,))
        funcs = cur.fetchall()
        functions_by_event[ev_id] = [
            {"id": row[0], "date": str(row[1]), "time": str(row[2])} for row in funcs
        ]
        
        print(f"Event: {name} | ID {ev_id} | Sections: {len(sections_by_event[ev_id])} | Functions: {len(functions_by_event[ev_id])}")

    # 9. Generate seats pool to sell
    # Structure: seats_pool[event_id][function_id][section_id] = List of unique seat_ids
    seats_pool = {}
    section_price_map = {} # section_id -> price
    section_name_map = {} # section_id -> name
    
    for ev_id, sections in sections_by_event.items():
        seats_pool[ev_id] = {}
        funcs = functions_by_event.get(ev_id, [])
        if not funcs:
            print(f"Warning: No functions for Event ID {ev_id}. Skipping seat pool.")
            continue
            
        for fn in funcs:
            fn_id = fn["id"]
            seats_pool[ev_id][fn_id] = {}
            
            # Find target sell rate
            ev_name = [name for name, d in event_id_map.items() if d["id"] == ev_id][0]
            target_pct = targets_by_name[ev_name]
            
            for sec in sections:
                sec_id = sec["id"]
                sec_name = sec["name"]
                sec_price = sec["price"]
                sec_capacity = sec["capacity"]
                
                section_price_map[sec_id] = sec_price
                section_name_map[sec_id] = sec_name
                
                # Proportional capacity per function (since multiple functions share same venue rooms)
                # But actually, capacity in sections is already the sum capacity or function capacity?
                # In seed_custom_events.py, total_capacity = sum of capacity of functions.
                # Section capacity is total_capacity * percentage.
                # So section capacity is indeed the total sum across all functions!
                # Therefore, capacity per function is sec_capacity / len(funcs)
                cap_per_func = int(sec_capacity / len(funcs))
                if cap_per_func <= 0:
                    cap_per_func = sec_capacity # Fallback
                    
                target_sold_per_func = int(cap_per_func * target_pct)
                if target_sold_per_func <= 0:
                    target_sold_per_func = 1
                
                # Generate all possible seats for this function and section
                all_seats = generate_seats_for_section(sec_id, cap_per_func)
                random.shuffle(all_seats)
                
                # We only sell the target percentage of seats
                seats_to_sell = all_seats[:target_sold_per_func]
                seats_pool[ev_id][fn_id][sec_id] = seats_to_sell

    # 10. Generate transactions (tickets + payments)
    print("Generating tickets and payments from the seat pools...")
    tickets_to_insert = []
    payments_to_insert = []
    mongo_sync_docs = [] # For MongoDB
    
    # Helper to pick a random user
    def get_random_user():
        return random.choice(user_ids)
        
    # Group available seats into orders
    # We will build a list of all sections that still have seats to sell
    active_sections = []
    for ev_id, funcs_dict in seats_pool.items():
        for fn_id, secs_dict in funcs_dict.items():
            for sec_id, seats in secs_dict.items():
                if seats:
                    active_sections.append((ev_id, fn_id, sec_id))
                    
    # Generate purchases until all target seats are sold
    total_tickets_generated = 0
    total_payments_generated = 0
    
    print(f"Total sections to sell from: {len(active_sections)}")
    
    # Shuffle sections to randomize purchase sequence
    random.shuffle(active_sections)
    
    # We will track how many tickets we sold for updating database totals later
    tickets_sold_by_section = {} # sec_id -> count
    tickets_sold_by_event = {} # ev_id -> count
    
    for ev_id, fn_id, sec_id in active_sections:
        seats = seats_pool[ev_id][fn_id][sec_id]
        price = section_price_map[sec_id]
        sec_name = section_name_map[sec_id]
        ticket_type = determine_ticket_type(sec_name)
        
        # Pull seats in groups of 1 to 4
        i = 0
        while i < len(seats):
            group_size = random.choices([1, 2, 3, 4], weights=[55, 35, 5, 5])[0]
            chunk = seats[i : i + group_size]
            i += group_size
            
            if not chunk:
                break
                
            user_id = get_random_user()
            
            # Purchase Date: random datetime between 2026-01-01 and 2026-05-24
            days_offset = random.randint(0, 143) # 144 days between Jan 1 and May 24
            hours_offset = random.randint(0, 23)
            minutes_offset = random.randint(0, 59)
            seconds_offset = random.randint(0, 59)
            purchase_dt = datetime(2026, 1, 1) + timedelta(
                days=days_offset, hours=hours_offset, minutes=minutes_offset, seconds=seconds_offset
            )
            purchase_date_str = purchase_dt.strftime("%Y-%m-%d %H:%M:%S")
            purchase_date_iso = purchase_dt.isoformat()
            
            payment_method = random.choice(["card", "paypal", "oxxo", "transfer"])
            
            # Create payment record
            payment_amount = price * len(chunk)
            payment_ref = f"PAY-{uuid.uuid4().hex[:8].upper()}"
            transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            
            payments_to_insert.append((
                user_id, ev_id, payment_amount, payment_method, transaction_id, "completed", purchase_date_str, payment_ref, purchase_date_str
            ))
            total_payments_generated += 1
            
            # MongoDB payment confirmation doc
            mongo_sync_docs.append({
                "user_id": user_id,
                "event_id": ev_id,
                "amount": float(payment_amount),
                "payment_method": payment_method,
                "reference": payment_ref,
                "status": "completed",
                "confirmed_at": purchase_date_iso,
                "type": "payment_confirmation"
            })
            
            # Create ticket records
            for seat_id in chunk:
                ticket_code = f"TKT-{uuid.uuid4().hex[:8].upper()}"
                
                tickets_to_insert.append((
                    ticket_code, ev_id, user_id, ticket_type, price, purchase_date_str, "active",
                    fn_id, sec_name, seat_id, ticket_code, payment_method
                ))
                total_tickets_generated += 1
                
                # MongoDB ticket purchase doc
                mongo_sync_docs.append({
                    "user_id": user_id,
                    "event_id": ev_id,
                    "ticket_code": ticket_code,
                    "price": float(price),
                    "seat_id": seat_id,
                    "section": sec_name,
                    "payment_method": payment_method,
                    "purchase_date": purchase_date_iso,
                    "type": "ticket_purchase"
                })
                
                # Update counters
                tickets_sold_by_section[sec_id] = tickets_sold_by_section.get(sec_id, 0) + 1
                tickets_sold_by_event[ev_id] = tickets_sold_by_event.get(ev_id, 0) + 1

    print(f"Generated {total_tickets_generated} tickets and {total_payments_generated} payments.")

    # 11. Insert tickets into MySQL
    print("Inserting tickets in MySQL...")
    batch_size = 5000
    for i in range(0, len(tickets_to_insert), batch_size):
        cur.executemany("""
            INSERT INTO tickets (ticket_code, event_id, user_id, ticket_type, price, purchase_date, status, event_function_id, section_name, seat_id, qr_data, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, tickets_to_insert[i:i+batch_size])
        conn.commit()
        print(f"  Inserted tickets {i} to {min(i+batch_size, len(tickets_to_insert))}...")

    # 12. Insert payments into MySQL
    print("Inserting payments in MySQL...")
    for i in range(0, len(payments_to_insert), batch_size):
        cur.executemany("""
            INSERT INTO payments (user_id, event_id, amount, payment_method, transaction_id, status, payment_date, reference, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, payments_to_insert[i:i+batch_size])
        conn.commit()
        print(f"  Inserted payments {i} to {min(i+batch_size, len(payments_to_insert))}...")

    # 13. Update available ticket counts in events and sections
    print("Updating available tickets and capacities in events and event_ticket_sections...")
    
    # Update sections available counts
    for sec_id, sold_count in tickets_sold_by_section.items():
        cur.execute("UPDATE event_ticket_sections SET available = capacity - %s WHERE id = %s", (sold_count, sec_id))
        
    # Update events available tickets counts
    for ev_id, sold_count in tickets_sold_by_event.items():
        cur.execute("UPDATE events SET available_tickets = total_tickets - %s WHERE id = %s", (sold_count, ev_id))
        
    conn.commit()
    print("Database counts updated successfully.")
    
    # 14. MongoDB Atlas Sync
    print("Attempting to sync transactions to MongoDB Atlas purchases collection...")
    sync_to_mongo(mongo_sync_docs, env)
    
    conn.close()
    print("=== SEEDING PROCESS COMPLETED SUCCESSFULLY ===")

def sync_to_mongo(mongo_docs, env):
    mongo_uri = env.get("MONGO_URI")
    db_name = env.get("MONGO_DB", "laika_analytics")
    
    if not mongo_uri:
        print("[MONGO] MONGO_URI not found in environment, skipping sync.")
        return
        
    try:
        from pymongo import MongoClient
        print("[MONGO] Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        client.server_info() # Force connection check
        db = client[db_name]
        coll = db["purchases"]
        
        print("[MONGO] Connected! Clearing existing purchases in MongoDB Atlas...")
        coll.delete_many({})
        
        print(f"[MONGO] Inserting {len(mongo_docs)} documents...")
        batch_size = 5000
        for i in range(0, len(mongo_docs), batch_size):
            coll.insert_many(mongo_docs[i:i+batch_size])
            print(f"  Synced documents {i} to {min(i+batch_size, len(mongo_docs))}...")
        print("[MONGO] MongoDB Atlas synchronization completed successfully.")
    except Exception as e:
        print(f"[MONGO] MongoDB Atlas synchronization failed (network/TLS error): {e}")
        print("[MONGO] This is fine since local MySQL is successfully populated and active.")

if __name__ == "__main__":
    main()
