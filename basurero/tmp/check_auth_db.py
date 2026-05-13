
import sqlite3
import os

db_path = "microservices/auth/auth.db"
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, first_name, email, role, password_hash, status FROM users")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}, Status: {row[5]}")
            print(f"  Hash: {row[4][:20]}...")
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {e}")
