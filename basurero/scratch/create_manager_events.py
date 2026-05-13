import os
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker
import hashlib
import datetime

def hashed(password):
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except:
        return hashlib.sha256(password.encode()).hexdigest()

from dotenv import load_dotenv
load_dotenv()

# MySQL URL
MYSQL_URL = f"mysql+pymysql://{os.environ.get('MYSQL_USER', 'root')}:{os.environ.get('MYSQL_PASSWORD', '')}@{os.environ.get('MYSQL_HOST', 'localhost')}:3306/{os.environ.get('MYSQL_DATABASE', 'laika_club')}"

try:
    engine = create_engine(MYSQL_URL)
    engine.connect()
except Exception:
    import sqlite3
    db_path = "c:/Users/redja/Music/laika uv/laika_club_version_actual_3.0.0/microservices/auth/auth.db"
    events_db_path = "c:/Users/redja/Music/laika uv/laika_club_version_actual_3.0.0/microservices/events/events.db"
    engine = None

if engine:
    Session = sessionmaker(bind=engine)
    session = Session()
    meta = MetaData()
    meta.reflect(bind=engine)
    users = meta.tables['users']
    events = meta.tables['events']

    # Delete if exists
    session.execute(users.delete().where(users.c.email == 'gestor_4events@laikaclub.com'))
    session.commit()

    email = 'gestor_4events@laikaclub.com'
    password = 'password123'

    ins = users.insert().values(
        first_name='Gestor',
        last_name='Especial',
        email=email,
        phone='1234567890',
        password_hash=hashed(password),
        role='manager',
        status='active',
        created_at=datetime.datetime.now().isoformat()
    )
    res = session.execute(ins)
    user_id = res.inserted_primary_key[0]
    session.commit()

    # Create 4 events
    for i in range(1, 5):
        session.execute(events.insert().values(
            name=f'Evento Secreto {i}',
            description='Evento con aforo X',
            event_date='2026-05-01',
            event_time='20:00',
            location='Local XYZ',
            venue='Venue ABC',
            category='Fiesta',
            price=150.0,
            total_tickets=500,
            available_tickets=500,
            image_url='https://via.placeholder.com/150',
            status='public',
            created_by=user_id,
            grid_position_x=0,
            grid_position_y=0,
            grid_span_x=1,
            grid_span_y=1,
            grid_page=0
        ))
    session.commit()
    print(f"EMAIL={email}")
    print(f"PASSWORD={password}")
else:
    import sqlite3
    # SQLite
    conn_a = sqlite3.connect(db_path)
    cur_a = conn_a.cursor()
    email = 'gestor_4events@laikaclub.com'
    password = 'password123'
    cur_a.execute("DELETE FROM users WHERE email=?", (email,))
    cur_a.execute("INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
        ('Gestor', 'Especial', email, '1234567890', hashed(password), 'manager', 'active', datetime.datetime.now().isoformat()))
    user_id = cur_a.lastrowid
    conn_a.commit()
    
    conn_e = sqlite3.connect(events_db_path)
    cur_e = conn_e.cursor()
    for i in range(1, 5):
        cur_e.execute("INSERT INTO events (name, status, created_by, total_tickets, available_tickets) VALUES (?, ?, ?, ?, ?)",
            (f'Evento Secreto {i}', 'public', user_id, 500, 500))
    conn_e.commit()
    print(f"EMAIL={email}")
    print(f"PASSWORD={password}")
