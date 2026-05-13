import sqlite3
import os
import sys

# Add auth directory to path to import security
sys.path.append(os.path.join(os.getcwd(), 'microservices', 'auth'))

try:
    from security import get_password_hash
    print("Security module imported successfully.")
except ImportError as e:
    print(f"Error importing security: {e}")
    exit(1)

db_path = 'microservices/auth/auth.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'usuario@laikaclub.com'
new_password = 'usuario123'
password_hash = get_password_hash(new_password)

cursor.execute("UPDATE users SET password_hash = ?, failed_attempts = 0, lockout_until = NULL WHERE LOWER(email) = ?", (password_hash, email.lower()))
conn.commit()

if cursor.rowcount > 0:
    print(f"Password for {email} has been reset to '{new_password}'.")
else:
    print(f"User {email} NOT found or not updated.")

conn.close()
