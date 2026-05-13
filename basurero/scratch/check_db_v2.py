import pymysql
import os
from dotenv import load_dotenv

def check_counts():
    load_dotenv()
    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club'),
        cursorclass=pymysql.cursors.DictCursor
    )
    cursor = conn.cursor()
    
    print("--- MySQL Table Counts ---")
    cursor.execute("SHOW TABLES")
    tables = [t[f"Tables_in_{os.getenv('MYSQL_DATABASE', 'laika_club')}"] for t in cursor.fetchall()]
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
        print(f"{table}: {cursor.fetchone()['count']}")
        
    print("\n--- Admin Status ---")
    cursor.execute("SELECT id, email, role, status FROM users WHERE role != 'usuario'")
    admins = cursor.fetchall()
    for admin in admins:
        print(admin)
        
    print("\n--- Synthetic Data (Default Pass) ---")
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE password_hash = 'pbkdf2:sha256:260000$default_pass'")
    print(f"Users with synthetic hash: {cursor.fetchone()['count']}")
    
    conn.close()

if __name__ == "__main__":
    check_counts()
