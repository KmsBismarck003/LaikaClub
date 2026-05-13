import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

user = os.getenv('MYSQL_USER', 'root')
pwd = os.getenv('MYSQL_PASSWORD', '')
host = os.getenv('MYSQL_HOST', 'localhost')
dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')

engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")

MEXICO_STATES = [
    ("Aguascalientes", "AS"), ("Baja California", "BC"), ("Baja California Sur", "BS"),
    ("Campeche", "CC"), ("Chiapas", "CS"), ("Chihuahua", "CH"), ("Ciudad de México", "DF"),
    ("Coahuila", "CL"), ("Colima", "CM"), ("Durango", "DG"), ("Guanajuato", "GT"),
    ("Guerrero", "GR"), ("Hidalgo", "HG"), ("Jalisco", "JC"), ("México", "MC"),
    ("Michoacán", "MN"), ("Morelos", "MS"), ("Nayarit", "NT"), ("Nuevo León", "NL"),
    ("Oaxaca", "OC"), ("Puebla", "PL"), ("Querétaro", "QT"), ("Quintana Roo", "QR"),
    ("San Luis Potosí", "SP"), ("Sinaloa", "SL"), ("Sonora", "SR"), ("Tabasco", "TC"),
    ("Tamaulipas", "TS"), ("Tlaxcala", "TL"), ("Veracruz", "VZ"), ("Yucatán", "YN"),
    ("Zacatecas", "ZS")
]

CDMX_MUNICIPALITIES = [
    "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa de Morelos",
    "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "La Magdalena Contreras",
    "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
]

def seed():
    with engine.connect() as conn:
        # Check if Mexico exists
        res = conn.execute(text("SELECT id FROM countries WHERE code = 'MX'")).fetchone()
        if not res:
            conn.execute(text("INSERT INTO countries (name, code) VALUES ('México', 'MX')"))
            country_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
        else:
            country_id = res[0]
        
        # Seed States
        for state_name, state_code in MEXICO_STATES:
            res = conn.execute(text("SELECT id FROM states WHERE name = :name"), {"name": state_name}).fetchone()
            if not res:
                conn.execute(text("INSERT INTO states (country_id, name, code) VALUES (:cid, :name, :code)"), 
                             {"cid": country_id, "name": state_name, "code": state_code})
                state_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
            else:
                state_id = res[0]
            
            # If CDMX, seed municipalities
            if state_name == "Ciudad de México":
                for muni in CDMX_MUNICIPALITIES:
                    res = conn.execute(text("SELECT id FROM municipalities WHERE name = :name AND state_id = :sid"), 
                                       {"name": muni, "sid": state_id}).fetchone()
                    if not res:
                        conn.execute(text("INSERT INTO municipalities (state_id, name) VALUES (:sid, :name)"), 
                                     {"sid": state_id, "name": muni})

        conn.commit()
        print("Seeding completed successfully.")

if __name__ == "__main__":
    seed()
