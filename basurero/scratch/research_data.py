import sqlite3
import os

def query_db(db_path, query):
    if not os.path.exists(db_path):
        return f"Error: {db_path} no existe"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(query)
        res = cursor.fetchall()
        # Obtener nombres de columnas
        cols = [description[0] for description in cursor.description]
        conn.close()
        return {"columns": cols, "data": res}
    except Exception as e:
        return str(e)

print("--- BUSCANDO A JUAN ---")
res_juan = query_db("microservices/auth/auth.db", "SELECT id, email, full_name, role FROM users WHERE full_name LIKE '%juan%' OR email LIKE '%juan%';")
print(res_juan)

print("\n--- BUSCANDO EVENTOS ---")
res_events = query_db("microservices/events/events.db", "SELECT id, name, date, price FROM events LIMIT 5;")
print(res_events)

print("\n--- ESQUEMA TICKETS ---")
res_t_schema = query_db("microservices/tickets/tickets.db", "PRAGMA table_info(tickets);")
print(res_t_schema)

print("\n--- ESQUEMA PAYMENTS ---")
res_p_schema = query_db("microservices/tickets/tickets.db", "PRAGMA table_info(payments);")
print(res_p_schema)
