import sqlite3
import os

db = 'microservices/auth/auth.db'
conn = sqlite3.connect(db)
c = conn.cursor()
c.execute("SELECT id, first_name, last_name, email FROM users WHERE first_name LIKE '%Juan%' OR last_name LIKE '%Juan%' OR email LIKE '%juan%'")
results = c.fetchall()
print(results)
conn.close()
