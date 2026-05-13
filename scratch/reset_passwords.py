import sqlite3
from passlib.context import CryptContext
import os

DB_PATH = "microservices/auth/auth.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password = "gearsof2"
new_hash = pwd_context.hash(password)

accounts = [
    "admin@laikaclub.com",
    "operador@laikaclub.com",
    "gestor@laikaclub.com"
]

if not os.path.exists(DB_PATH):
    print(f"Error: {DB_PATH} not found")
    exit(1)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

for email in accounts:
    cursor.execute("UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)", (new_hash, email))
    if cursor.rowcount > 0:
        print(f"Updated password for {email}")
    else:
        print(f"User {email} not found, creating...")
        # Optional: create user if not found? 
        # But the seeding script should have created them.
        # Let's just update for now.

conn.commit()
conn.close()
print("Password reset complete.")
