import os
import sqlite3
import pymysql
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# List of custom events we will manage
CUSTOM_EVENT_NAMES = [
    "Afterlife México 2026",
    "Vive Latino 2026",
    "Rammstein: Zeit Tour 2026",
    "Fórmula 1 Gran Premio de México 2026",
    "Avengers: Endgame (Función Especial)",
    "Cine Club: Joyas de la Animación",
    "Michael Jackson Sinfónico",
    "Festival de Rock Urbano",
    "Concierto Especial de Otoño: Noviembre 4"
]

def clean_database(cur, placeholder):
    """Deletes existing custom events and clean up orphaned functions/sections/rules."""
    print("Cleaning database...")
    # Delete ticket sections, rules, and functions first to avoid foreign key issues
    for name in CUSTOM_EVENT_NAMES:
        cur.execute(f"SELECT id FROM events WHERE name = {placeholder}", (name,))
        rows = cur.fetchall()
        for r in rows:
            ev_id = r[0]
            cur.execute(f"DELETE FROM event_functions WHERE event_id = {placeholder}", (ev_id,))
            cur.execute(f"DELETE FROM event_ticket_sections WHERE event_id = {placeholder}", (ev_id,))
            cur.execute(f"DELETE FROM event_rules WHERE event_id = {placeholder}", (ev_id,))
    
    # Delete the events themselves
    for name in CUSTOM_EVENT_NAMES:
        cur.execute(f"DELETE FROM events WHERE name = {placeholder}", (name,))
        
    print("Database cleaned for custom events.")

def get_venues_and_rooms(cur):
    """Fetches all venues and their rooms, grouping rooms by venue_id."""
    cur.execute("SELECT id, name, city, capacity, municipality_id FROM venues")
    venues_rows = cur.fetchall()
    
    cur.execute("SELECT id, venue_id, name, capacity FROM venue_rooms")
    rooms_rows = cur.fetchall()
    
    rooms_by_venue = {}
    for r in rooms_rows:
        room_id, venue_id, r_name, r_cap = r
        if venue_id not in rooms_by_venue:
            rooms_by_venue[venue_id] = []
        rooms_by_venue[venue_id].append({
            "id": room_id,
            "name": r_name,
            "capacity": r_cap
        })
        
    venues = []
    for v in venues_rows:
        v_id, v_name, v_city, v_cap, v_mun_id = v
        # Only use venues that have rooms defined
        if v_id in rooms_by_venue and rooms_by_venue[v_id]:
            venues.append({
                "id": v_id,
                "name": v_name,
                "city": v_city or "México",
                "capacity": v_cap or sum(r["capacity"] for r in rooms_by_venue[v_id]),
                "municipality_id": v_mun_id,
                "rooms": rooms_by_venue[v_id]
            })
            
    return venues

def seed_db_connection(conn, cur, placeholder, is_mysql=False):
    # 1. Clean old custom events
    clean_database(cur, placeholder)
    
    # 2. Get venues and rooms
    venues = get_venues_and_rooms(cur)
    if not venues:
        print("Warning: No venues found in this database. Seeding cannot proceed.")
        return
    
    print(f"Found {len(venues)} venues with rooms.")
    
    # Classify venues
    massive_venues = []
    cinema_venues = []
    other_venues = []
    
    for v in venues:
        name_lower = v["name"].lower()
        if v["capacity"] >= 2000 or any(kw in name_lower for kw in ["estadio", "arena", "parque", "auditorio", "foro"]):
            massive_venues.append(v)
        elif any(kw in name_lower for kw in ["cine", "cinepolis", "teatro", "sala", "cultural"]):
            cinema_venues.append(v)
        else:
            other_venues.append(v)
            
    # Fallbacks in case classifications are empty
    if not massive_venues:
        massive_venues = venues
    if not cinema_venues:
        cinema_venues = venues
    if not other_venues:
        other_venues = venues
        
    print(f"Classification: {len(massive_venues)} Massive, {len(cinema_venues)} Cinema, {len(other_venues)} Other")
    
    # Definitions of custom events to insert
    event_specs = [
        {
            "name": "Afterlife México 2026",
            "description": "El festival de techno melódico y arte visual más impactante del mundo regresa a México con una producción monumental y una experiencia audiovisual inmersiva sin precedentes.",
            "category": "concert",
            "price": 1800.00,
            "image_url": "/uploads/imagenes/afterlife.png",
            "scheduling": "massive",
            "dates": ["2026-10-17", "2026-10-24"],
            "time": "21:00"
        },
        {
            "name": "Vive Latino 2026",
            "description": "El Festival Iberoamericano de Cultura Musical Vive Latino celebra una nueva edición reuniendo a las leyendas del rock, pop y géneros alternativos en dos fines de semana espectaculares.",
            "category": "festival",
            "price": 1500.00,
            "image_url": "/uploads/imagenes/Vive-Latino-2018-Promoción.jpg",
            "scheduling": "massive",
            "dates": ["2026-11-14", "2026-11-21"],
            "time": "13:00"
        },
        {
            "name": "Rammstein: Zeit Tour 2026",
            "description": "La banda alemana de metal industrial más famosa del mundo regresa a México con su Zeit Tour. Prepárate para un espectáculo cargado de pirotecnia masiva, fuego y un sonido demoledor.",
            "category": "concert",
            "price": 2200.00,
            "image_url": "/uploads/imagenes/Rammstein3.jpg",
            "scheduling": "massive",
            "dates": ["2026-12-05", "2026-12-12"],
            "time": "20:30"
        },
        {
            "name": "Fórmula 1 Gran Premio de México 2026",
            "description": "Siente la adrenalina y la velocidad de la máxima categoría del automovilismo mundial. El Gran Premio de México reúne a los mejores pilotos del planeta en una fiesta de motor y pasión inigualable.",
            "category": "sport",
            "price": 3500.00,
            "image_url": "/uploads/imagenes/Fórmula-1.jpg",
            "scheduling": "massive",
            "dates": ["2026-10-30", "2026-11-01"],
            "time": "10:00"
        },
        {
            "name": "Avengers: Endgame (Función Especial)",
            "description": "Revive en pantalla grande y con sonido envolvente la batalla final más épica de la historia de los superhéroes. Una función especial para los verdaderos fanáticos del Universo Cinematográfico de Marvel.",
            "category": "theater",
            "price": 150.00,
            "image_url": "/uploads/imagenes/avengers.png",
            "scheduling": "movie",
            "dates": ["2026-07-10", "2026-07-11", "2026-07-12"],
            "times": ["14:00", "17:30", "21:00"]
        },
        {
            "name": "Cine Club: Joyas de la Animación",
            "description": "Un ciclo especial dedicado a las obras maestras de la animación mundial. Ven a disfrutar de clásicos y cortometrajes galardonados en una atmósfera íntima y cultural.",
            "category": "theater",
            "price": 80.00,
            "image_url": "/uploads/imagenes/images.jpg",
            "scheduling": "movie",
            "dates": ["2026-07-17", "2026-07-18", "2026-07-19"],
            "times": ["16:00", "19:30"]
        },
        {
            "name": "Michael Jackson Sinfónico",
            "description": "Un homenaje espectacular al Rey del Pop. Los grandes éxitos de Michael Jackson interpretados por una orquesta sinfónica en vivo junto a bailarines y cantantes invitados.",
            "category": "concert",
            "price": 750.00,
            "image_url": "/uploads/imagenes/MJSinfónico_Preventa_1920x1080.jpg",
            "scheduling": "standard",
            "dates": ["2026-08-14", "2026-08-15"],
            "time": "20:00"
        },
        {
            "name": "Festival de Rock Urbano",
            "description": "El foro alternativo se llena de energía con las mejores bandas de rock urbano nacional. Una noche de letras crudas, guitarras distorsionadas y pura pasión callejera.",
            "category": "concert",
            "price": 400.00,
            "image_url": "/uploads/imagenes/maxresdefault.jpg",
            "scheduling": "standard",
            "dates": ["2026-09-12"],
            "time": "18:00"
        },
        {
            "name": "Concierto Especial de Otoño: Noviembre 4",
            "description": "Una velada acústica e íntima para celebrar la llegada del otoño. Disfruta de baladas románticas y música trova con artistas locales de gran renombre.",
            "category": "concert",
            "price": 650.00,
            "image_url": "/uploads/imagenes/Nov-4.jpg",
            "scheduling": "standard",
            "dates": ["2026-11-04"],
            "time": "20:00"
        }
    ]

    event_ids = {} # name -> id
    event_by_name = {spec["name"]: spec for spec in event_specs}
    
    events_inserted = 0
    functions_inserted = 0
    sections_inserted = 0
    rules_inserted = 0

    first_venue = venues[0]
    first_room = first_venue["rooms"][0]

    # 3. Create Event records with initial info
    for spec in event_specs:
        event_data = {
            "name": spec["name"],
            "description": spec["description"],
            "event_date": spec["dates"][0] if "dates" in spec else "2026-10-01",
            "event_time": spec.get("time", spec.get("times", ["20:00"])[0]),
            "location": first_venue["city"],
            "venue": first_venue["name"],
            "category": spec["category"],
            "price": spec["price"],
            "total_tickets": 1000,
            "available_tickets": 1000,
            "image_url": spec["image_url"],
            "status": "published",
            "created_by": 1,
            "grid_position_x": 0,
            "grid_position_y": 0,
            "grid_span_x": 1,
            "grid_span_y": 1,
            "grid_page": 0,
            "use_seating_map": 0,
            "venue_id": first_venue["id"],
            "room_id": first_room["id"],
            "municipality_id": first_venue["municipality_id"]
        }
        cols = ", ".join(f"`{k}`" for k in event_data.keys())
        vals = ", ".join(placeholder for _ in event_data)
        
        cur.execute(f"INSERT INTO events ({cols}) VALUES ({vals})", tuple(event_data.values()))
        
        if is_mysql:
            cur.execute("SELECT LAST_INSERT_ID()")
            event_id = cur.fetchone()[0]
        else:
            event_id = cur.lastrowid
            
        event_ids[spec["name"]] = event_id
        events_inserted += 1

    # Keep track of functions added per event
    functions_by_event = {spec["name"]: [] for spec in event_specs}

    # Extract group specs
    massive_events = [spec for spec in event_specs if spec["scheduling"] == "massive"]
    movie_events = [spec for spec in event_specs if spec["scheduling"] == "movie"]
    standard_events = [spec for spec in event_specs if spec["scheduling"] == "standard"]

    # Assign functions to ALL venues to fill the database
    for v in venues:
        # Check type
        is_m = v in massive_venues
        is_c = v in cinema_venues
        
        if is_m:
            # Massive: pick 2 massive events
            chosen = random.sample(massive_events, 2)
            for ev in chosen:
                r = v["rooms"][0]
                d = random.choice(ev["dates"])
                func_info = {
                    "date": d,
                    "time": ev["time"],
                    "venue_id": v["id"],
                    "room_id": r["id"],
                    "room_capacity": r["capacity"],
                    "venue_name": v["name"],
                    "venue_city": v["city"]
                }
                functions_by_event[ev["name"]].append(func_info)
        elif is_c:
            # Cinema: assign both movies
            for ev in movie_events:
                # Add 2 functions in different rooms/dates/times
                rooms_to_use = v["rooms"][:2]
                for r_idx, r in enumerate(rooms_to_use):
                    d = ev["dates"][r_idx % len(ev["dates"])]
                    t = ev["times"][(r_idx * 2) % len(ev["times"])]
                    func_info = {
                        "date": d,
                        "time": t,
                        "venue_id": v["id"],
                        "room_id": r["id"],
                        "room_capacity": r["capacity"],
                        "venue_name": v["name"],
                        "venue_city": v["city"]
                    }
                    functions_by_event[ev["name"]].append(func_info)
        else:
            # Other: pick 2 standard events
            chosen = random.sample(standard_events, min(2, len(standard_events)))
            for ev in chosen:
                r = v["rooms"][0]
                d = random.choice(ev["dates"])
                func_info = {
                    "date": d,
                    "time": ev["time"],
                    "venue_id": v["id"],
                    "room_id": r["id"],
                    "room_capacity": r["capacity"],
                    "venue_name": v["name"],
                    "venue_city": v["city"]
                }
                functions_by_event[ev["name"]].append(func_info)

    # Insert functions and update main event data
    for name, funcs in functions_by_event.items():
        event_id = event_ids[name]
        spec = event_by_name[name]
        
        # If no functions were added for some reason, add a default one
        if not funcs:
            r = first_room
            funcs.append({
                "date": spec["dates"][0] if "dates" in spec else "2026-10-01",
                "time": spec.get("time", spec.get("times", ["20:00"])[0]),
                "venue_id": first_venue["id"],
                "room_id": r["id"],
                "room_capacity": r["capacity"],
                "venue_name": first_venue["name"],
                "venue_city": first_venue["city"]
            })
            
        # Write event_functions to db
        for f in funcs:
            cur.execute(
                f"INSERT INTO event_functions (event_id, date, time, venue_id, room_id) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
                (event_id, f["date"], f["time"], f["venue_id"], f["room_id"])
            )
            functions_inserted += 1
            
        # Update events table with details of the first function
        first_f = funcs[0]
        total_capacity = sum(f["room_capacity"] for f in funcs)
        
        cur.execute(
            f"UPDATE events SET event_date = {placeholder}, event_time = {placeholder}, location = {placeholder}, venue = {placeholder}, venue_id = {placeholder}, room_id = {placeholder}, total_tickets = {placeholder}, available_tickets = {placeholder} WHERE id = {placeholder}",
            (first_f["date"], first_f["time"], first_f["venue_city"], first_f["venue_name"], first_f["venue_id"], first_f["room_id"], total_capacity, total_capacity, event_id)
        )
        
        # 5. Insert Ticket Sections
        sections = []
        if spec["category"] == "sport":
            sections = [
                {"name": "Paddock VIP", "price": spec["price"] * 2.2, "pct": 0.05, "badge": "Acceso Total", "color": "#FF0000"},
                {"name": "Grada A Preferente", "price": spec["price"] * 1.0, "pct": 0.45, "badge": "Excelente Vista", "color": "#FFD700"},
                {"name": "General de Pie", "price": spec["price"] * 0.5, "pct": 0.50, "badge": "Mejor Ambiente", "color": "#008000"}
            ]
        elif spec["category"] in ["concert", "festival"]:
            sections = [
                {"name": "VIP Platinum", "price": spec["price"] * 1.8, "pct": 0.10, "badge": "Cerca del Escenario", "color": "#8A2BE2"},
                {"name": "General VIP", "price": spec["price"] * 1.2, "pct": 0.20, "badge": "Zona Preferente", "color": "#FF4500"},
                {"name": "General de Pie", "price": spec["price"] * 0.8, "pct": 0.70, "badge": "Acceso General", "color": "#1E90FF"}
            ]
        else: # theater, other, movie
            sections = [
                {"name": "VIP Box", "price": spec["price"] * 1.6, "pct": 0.15, "badge": "Asientos Premium", "color": "#FFD700"},
                {"name": "General Confort", "price": spec["price"] * 1.0, "pct": 0.85, "badge": "Asientos Numerados", "color": "#1E90FF"}
            ]
            
        for sec in sections:
            sec_capacity = int(total_capacity * sec["pct"])
            cur.execute(
                f"INSERT INTO event_ticket_sections (event_id, name, price, capacity, available, badge_text, color_hex) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
                (event_id, sec["name"], sec["price"], sec_capacity, sec_capacity, sec["badge"], sec["color"])
            )
            sections_inserted += 1
            
        # 6. Insert Event Rules
        rules = [
            ("Reglas de Acceso", "alertTriangle", "No se permite el ingreso con alimentos, bebidas, cámaras profesionales ni objetos peligrosos. Sujeto a revisión de seguridad en la entrada."),
            ("Duración y Acceso", "info", "La duración aproximada es de 2 horas. Una vez iniciada la función o show, el acceso a la sala será controlado por el personal de asistencia.")
        ]
        for r_title, r_icon, r_desc in rules:
            cur.execute(
                f"INSERT INTO event_rules (event_id, title, icon, description) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})",
                (event_id, r_title, r_icon, r_desc)
            )
            rules_inserted += 1

    print(f"Successfully seeded: {events_inserted} events, {functions_inserted} functions, {sections_inserted} sections, {rules_inserted} rules.")

def seed_sqlite():
    db_path = "microservices/events/events.db"
    if not os.path.exists(db_path):
        print(f"SQLite DB not found at {db_path}")
        return
        
    print(f"\nConnecting to SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        seed_db_connection(conn, cur, "?", is_mysql=False)
        conn.commit()
        print("SQLite seeding completed successfully.")
    except Exception as e:
        conn.rollback()
        print(f"SQLite seeding failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        conn.close()

def seed_mysql():
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")

    print(f"\nConnecting to MySQL: {host} (user: {user}, db: {database})")
    conn = None
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            charset="utf8mb4"
        )
    except Exception as e:
        print(f"MySQL connection with password '{password}' failed: {e}. Trying fallback password 'root'...")
        try:
            conn = pymysql.connect(
                host=host,
                user=user,
                password="root",
                database=database,
                charset="utf8mb4"
            )
        except Exception as ex:
            print(f"MySQL fallback connection failed: {ex}")
            return

    cur = conn.cursor()
    try:
        seed_db_connection(conn, cur, "%s", is_mysql=True)
        conn.commit()
        print("MySQL seeding completed successfully.")
    except Exception as e:
        conn.rollback()
        print(f"MySQL seeding failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_sqlite()
    seed_mysql()
