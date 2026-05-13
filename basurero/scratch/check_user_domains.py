
import os
import sqlite3
from sqlalchemy import create_engine, text
from pathlib import Path
from dotenv import load_dotenv

# Path to the .env file in the root
PROJECT_ROOT = Path("c:/Users/Pc/Music/laika_club_version_actual_3.0")
load_dotenv(PROJECT_ROOT / ".env")

# Database URL from .env or fallback
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club')}"
SQLITE_PATH = PROJECT_ROOT / "microservices" / "auth" / "auth.db"

def check_users():
    print(f"Checking MySQL at {os.getenv('MYSQL_HOST', 'localhost')}...")
    try:
        engine = create_engine(MYSQL_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT email, role, status FROM users LIMIT 20"))
            print("--- Users in MySQL ---")
            for row in result:
                print(f"Email: {row[0]}, Role: {row[1]}, Status: {row[2]}")
            
            # Specifically check for gmail and usuriolaikaclub.com
            print("\nSearching for Gmail or usuriolaikaclub.com in MySQL...")
            result = conn.execute(text("SELECT email, role, status FROM users WHERE email LIKE '%gmail.com' OR email LIKE '%usuriolaikaclub.com' OR email LIKE '%laikaclub.com'"))
            for row in result:
                print(f"Found: {row[0]}, Role: {row[1]}, Status: {row[2]}")
    except Exception as e:
        print(f"MySQL check failed: {e}")
        
    print(f"\nChecking SQLite at {SQLITE_PATH}...")
    try:
        if os.path.exists(SQLITE_PATH):
            conn = sqlite3.connect(SQLITE_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT email, role, status FROM users LIMIT 20")
            rows = cursor.fetchall()
            print("--- Users in SQLite ---")
            for row in rows:
                print(f"Email: {row[0]}, Role: {row[1]}, Status: {row[2]}")
                
            # Specifically check for domains
            print("\nSearching for domains in SQLite...")
            cursor.execute("SELECT email, role, status FROM users WHERE email LIKE '%gmail.com' OR email LIKE '%usuriolaikaclub.com' OR email LIKE '%laikaclub.com'")
            rows = cursor.fetchall()
            for row in rows:
                print(f"Found: {row[0]}, Role: {row[1]}, Status: {row[2]}")
            conn.close()
        else:
            print("SQLite file not found.")
    except Exception as e:
        print(f"SQLite check failed: {e}")

if __name__ == "__main__":
    check_users()
