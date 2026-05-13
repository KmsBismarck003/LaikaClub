import sqlite3
import os
from passlib.context import CryptContext

db_path = 'microservices/auth/auth.db'
if not os.path.exists(db_path):
    print(f"File {db_path} does not exist")
else:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    new_password = "admin123"
    hashed_password = pwd_context.hash(new_password)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = 'admin@laikaclub.com'")
    user = cursor.fetchone()
    
    if user:
        print("Updating admin@laikaclub.com password to 'admin123'")
        cursor.execute("UPDATE users SET password_hash = ?, failed_attempts = 0, lockout_until = NULL WHERE email = 'admin@laikaclub.com'", (hashed_password,))
    else:
        print("Creating admin@laikaclub.com with password 'admin123'")
        from datetime import datetime
        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, password_hash, role, status, created_at)
            VALUES ('Admin', 'Laika', 'admin@laikaclub.com', ?, 'admin', 'active', ?)
        """, (hashed_password, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    print("Done.")
