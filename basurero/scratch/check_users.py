import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "laika_club"),
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, email, role, status, failed_attempts, lockout_until FROM users")
        users = cursor.fetchall()
        print("--- USERS IN MYSQL ---")
        for user in users:
            print(user)
    conn.close()
except Exception as e:
    print(f"Error connecting to MySQL: {e}")

# Also check SQLite fallback
import sqlite3
from pathlib import Path

DB_PATH = Path("microservices/auth/auth.db")
if DB_PATH.exists():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role, status, failed_attempts, lockout_until FROM users")
        users = cursor.fetchall()
        print("\n--- USERS IN SQLITE (FALLBACK) ---")
        for user in users:
            print(dict(user))
        conn.close()
    except Exception as e:
        print(f"Error connecting to SQLite: {e}")
else:
    print("\nSQLite Auth DB not found at microservices/auth/auth.db")
