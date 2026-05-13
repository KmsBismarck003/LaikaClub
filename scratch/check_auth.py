import sqlite3
import os

db_path = "microservices/auth/auth.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- USERS ---")
    cursor.execute("SELECT id, first_name, last_name, email, role, status, failed_attempts, lockout_until FROM users")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    
    print("\n--- RECENT AUTH LOGS ---")
    cursor.execute("SELECT created_at, event_type, email, summary FROM auth_logs ORDER BY created_at DESC LIMIT 10")
    logs = cursor.fetchall()
    for log in logs:
        print(log)
    
    conn.close()
