import sqlite3
import os

db = 'microservices/auth/auth.db'
conn = sqlite3.connect(db)
c = conn.cursor()

# Buscar en tabla users
c.execute("SELECT id, first_name, email FROM users WHERE LOWER(first_name) LIKE '%juan%' OR LOWER(email) LIKE '%juan%' LIMIT 1")
row = c.fetchone()

if row:
    print(f"FOUND_JUAN_ID:{row[0]}")
    print(f"FOUND_JUAN_NAME:{row[1]}")
    print(f"FOUND_JUAN_EMAIL:{row[2]}")
else:
    # Si no existe, usamos un ID alto o buscamos el ultimo
    c.execute("SELECT MAX(id) FROM users")
    max_id = c.fetchone()[0] or 0
    new_id = max_id + 1
    print(f"NOT_FOUND_JUAN_CREATING_WITH_ID:{new_id}")

conn.close()
