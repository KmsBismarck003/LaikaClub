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
    ("Guerrero", "GR"), ("Hidalgo", "HG"), ("Jalisco", "JC"), ("Estado de México", "MC"),
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

EDOMEX_MUNICIPALITIES = [
    "Acambay de Ruiz Castañeda", "Acolman", "Aculco", "Almoloya de Alquisiras", 
    "Almoloya de Juárez", "Almoloya del Río", "Amanalco", "Amatepec", 
    "Amecameca", "Apaxco", "Atenco", "Atizapán", "Atizapán de Zaragoza", 
    "Atlacomulco", "Atlautla", "Axapusco", "Ayapango", "Calimaya", 
    "Capulhuac", "Coacalco de Berriozábal", "Coatepec Harinas", "Cocotitlán", 
    "Coyotepec", "Cuautitlán", "Cuautitlán Izcalli", "Chalco", "Chapa de Mota", 
    "Chapultepec", "Chiautla", "Chicoloapan", "Chiconcuac", "Chimalhuacán", 
    "Donato Guerra", "Ecatepec de Morelos", "Ecatzingo", "Huehuetoca", 
    "Hueypoxtla", "Huixquilucan", "Isidro Fabela", "Ixtapaluca", 
    "Ixtapan de la Sal", "Ixtapan del Oro", "Ixtlahuaca", "Xalatlaco", 
    "Jaltenco", "Jilotepec", "Jilotzingo", "Jiquipilco", "Jocotitlán", 
    "Joquicingo", "Juchitepec", "Lerma", "Malinalco", "Melchor Ocampo", 
    "Metepec", "Mexicaltzingo", "Morelos", "Naucalpan de Juárez", "Nextlalpan", 
    "Nezahualcóyotl", "Nicolás Romero", "Nopaltepec", "Ocoyoacac", "Ocuilan", 
    "El Oro", "Otumba", "Otzoloapan", "Otzolotepec", "Ozumba", "Papalotla", 
    "La Paz", "Polotitlán", "Rayón", "San Antonio la Isla", "San Felipe del Progreso", 
    "San Martín de las Pirámides", "San Mateo Atenco", "San Simón de Guerrero", 
    "Santo Tomás", "Soyaniquilpan de Juárez", "Sultepec", "Tecámac", "Tejupilco", 
    "Temamatla", "Temascalapa", "Temascalcingo", "Temascaltepec", "Temoaya", 
    "Tenancingo", "Tenango del Aire", "Tenango del Valle", "Teoloyucan", 
    "Teotihuacán", "Tepetlaoxtoc", "Tepetlixpa", "Tepotzotlán", "Tequixquiac", 
    "Texcaltitlán", "Texcalyacac", "Texcoco", "Tezoyuca", "Tianguistenco", 
    "Timilpan", "Tlalmanalco", "Tlalnepantla de Baz", "Tlatlaya", "Toluca", 
    "Tonatico", "Tultepec", "Tultitlán", "Valle de Bravo", "Villa de Allende", 
    "Villa del Carbón", "Villa Guerrero", "Villa Victoria", "Xonacatlán", 
    "Zacazonapan", "Zacualpan", "Zinacantepec", "Zumpahuacán", "Zumpango", 
    "Valle de Chalco Solidaridad", "Luvianos", "San José del Rincón", "Tonanitla"
]

def seed():
    with engine.connect() as conn:
        # 1. Ensure Mexico exists in countries
        res = conn.execute(text("SELECT id FROM countries WHERE code = 'MX'")).fetchone()
        if not res:
            print("Creating country 'México'...")
            conn.execute(text("INSERT INTO countries (name, code) VALUES ('México', 'MX')"))
            country_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
        else:
            country_id = res[0]
            conn.execute(text("UPDATE countries SET name = 'México' WHERE id = :cid"), {"cid": country_id})
            print(f"Country 'México' verified (ID: {country_id})")
        
        # 2. Seed/Update States
        state_id_map = {}
        for state_name, state_code in MEXICO_STATES:
            res = conn.execute(text("SELECT id, name FROM states WHERE code = :code AND country_id = :cid"), 
                               {"code": state_code, "cid": country_id}).fetchone()
            if not res:
                res_name = conn.execute(text("SELECT id FROM states WHERE name = :name AND country_id = :cid"), 
                                        {"name": state_name, "cid": country_id}).fetchone()
                if not res_name:
                    print(f"Creating state: {state_name} ({state_code})...")
                    conn.execute(text("INSERT INTO states (country_id, name, code) VALUES (:cid, :name, :code)"), 
                                 {"cid": country_id, "name": state_name, "code": state_code})
                    state_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                else:
                    state_id = res_name[0]
                    conn.execute(text("UPDATE states SET code = :code, name = :name WHERE id = :sid"), 
                                 {"code": state_code, "name": state_name, "sid": state_id})
            else:
                state_id = res[0]
                existing_name = res[1]
                if existing_name != state_name:
                    print(f"Updating state name from '{existing_name}' to '{state_name}' (Code: {state_code})...")
                    conn.execute(text("UPDATE states SET name = :name WHERE id = :sid"), 
                                 {"name": state_name, "sid": state_id})
            
            state_id_map[state_name] = state_id

        # 3. Seed Municipalities for Ciudad de México
        cdmx_state_id = state_id_map.get("Ciudad de México")
        if cdmx_state_id:
            print(f"Seeding municipalities for Ciudad de México (ID: {cdmx_state_id})...")
            cdmx_count = 0
            for muni in CDMX_MUNICIPALITIES:
                res = conn.execute(text("SELECT id FROM municipalities WHERE name = :name AND state_id = :sid"), 
                                   {"name": muni, "sid": cdmx_state_id}).fetchone()
                if not res:
                    conn.execute(text("INSERT INTO municipalities (state_id, name) VALUES (:sid, :name)"), 
                                 {"sid": cdmx_state_id, "name": muni})
                    cdmx_count += 1
            print(f"Added {cdmx_count} new municipalities for Ciudad de México.")

        # 4. Seed Municipalities for Estado de México
        edomex_state_id = state_id_map.get("Estado de México")
        if edomex_state_id:
            print(f"Seeding municipalities for Estado de México (ID: {edomex_state_id})...")
            edomex_count = 0
            for muni in EDOMEX_MUNICIPALITIES:
                res = conn.execute(text("SELECT id FROM municipalities WHERE name = :name AND state_id = :sid"), 
                                   {"name": muni, "sid": edomex_state_id}).fetchone()
                if not res:
                    conn.execute(text("INSERT INTO municipalities (state_id, name) VALUES (:sid, :name)"), 
                                 {"sid": edomex_state_id, "name": muni})
                    edomex_count += 1
            print(f"Added {edomex_count} new municipalities for Estado de México.")

        conn.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
