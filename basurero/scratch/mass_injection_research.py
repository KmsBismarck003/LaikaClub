import sqlite3
import os

def get_data(db, q):
    if not os.path.exists(db): return []
    conn = sqlite3.connect(db)
    res = conn.execute(q).fetchall()
    conn.close()
    return res

print("ROLES EN AUTH:")
print(get_data('microservices/auth/auth.db', "SELECT DISTINCT role FROM users"))

print("\nCONTEO DE USUARIOS POR ROL:")
print(get_data('microservices/auth/auth.db', "SELECT role, COUNT(*) FROM users GROUP BY role"))

print("\nRESUMEN DE EVENTOS PUBLICADOS:")
print(get_data('microservices/events/events.db', "SELECT id, name, price FROM events WHERE status='published' LIMIT 10"))

print("\nCONTEO TOTAL EVENTOS:")
print(get_data('microservices/events/events.db', "SELECT COUNT(*) FROM events"))
