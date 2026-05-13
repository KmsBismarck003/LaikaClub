import sqlite3
import os

db_path = 'microservices/auth/auth.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'usuario@laikaclub.com'
cursor.execute("SELECT id, email, password_hash, role, status, failed_attempts, lockout_until FROM users WHERE LOWER(email) = ?", (email.lower(),))
user = cursor.fetchone()

if user:
    print(f"User found: ID={user[0]}, Email={user[1]}, Role={user[3]}, Status={user[4]}, FailedAttempts={user[5]}, LockoutUntil={user[6]}")
    # The user might be locked out or have a wrong password.
    # I'll check if I can reset it to 'usuario123' to be sure.
    # But first, let's just see if they exist.
else:
    print(f"User {email} NOT found in database.")
    # Show all users to see what emails are available
    print("\nExisting users in DB:")
    cursor.execute("SELECT email, role FROM users LIMIT 10")
    for row in cursor.fetchall():
        print(f" - {row[0]} ({row[1]})")

conn.close()
