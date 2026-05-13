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
        print("--- TARGETED USER CHECK ---")
        roles = ['admin', 'gestor', 'operador', 'usuario']
        for role in roles:
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = %s", (role,))
            res = cursor.fetchone()
            print(f"Role '{role}': {res['count']} users")
            
            if res['count'] > 0:
                cursor.execute("SELECT id, email, role, status FROM users WHERE role = %s LIMIT 3", (role,))
                samples = cursor.fetchall()
                for s in samples:
                    print(f"  Example: {s}")
        
        print("\nChecking for any blocked users:")
        cursor.execute("SELECT id, email, role, lockout_until FROM users WHERE lockout_until IS NOT NULL")
        blocked = cursor.fetchall()
        for b in blocked:
            print(f"  Blocked: {b}")

    conn.close()
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
