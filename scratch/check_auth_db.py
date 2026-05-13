import sqlite3
import os

db_path = 'microservices/auth/auth.db'
if not os.path.exists(db_path):
    print(f"File {db_path} does not exist")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print("Tables:", cursor.fetchall())
    
    try:
        cursor.execute("SELECT id, email, role, password_hash FROM users")
        users = cursor.fetchall()
        print("Users:")
        for u in users:
            print(f"ID: {u[0]}, Email: {u[1]}, Role: {u[2]}, Hash: {u[3][:20]}...")
    except Exception as e:
        print("Error reading users:", e)
    conn.close()
