import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_users():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor()
        cur.execute("SELECT id, email, first_name, role FROM users WHERE role = 'gestor'")
        rows = cur.fetchall()
        print(f"Found {len(rows)} gestores in MySQL:")
        for row in rows:
            print(f"ID: {row[0]}, Email: {row[1]}, Name: {row[2]}, Role: {row[3]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
