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
        cols = [description[0] for description in cursor.description]
        conn.close()
        return {"columns": cols, "data": res}
    except Exception as e:
        return str(e)

print("--- ESQUEMA USERS ---")
print(query_db("microservices/auth/auth.db", "PRAGMA table_info(users);"))

print("\n--- ESQUEMA EVENTS ---")
print(query_db("microservices/events/events.db", "PRAGMA table_info(events);"))

print("\n--- BUSCANDO A JUAN ---")
# Probamos nombres comunes si no sabemos las columnas exactas
res_juan = query_db("microservices/auth/auth.db", "SELECT * FROM users WHERE name LIKE '%juan%' OR email LIKE '%juan%' OR username LIKE '%juan%';")
print(res_juan)

print("\n--- BUSCANDO EVENTOS ---")
print(query_db("microservices/events/events.db", "SELECT * FROM events LIMIT 3;"))
