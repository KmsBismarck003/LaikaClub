
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_venues():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')

    try:
        conn = pymysql.connect(host=host, user=user, password=pwd, database=dbname, cursorclass=pymysql.cursors.DictCursor)
        cur = conn.cursor()

        print("--- VENUES ---")
        cur.execute("SELECT id, name, assigned_manager_id FROM venues")
        venues = cur.fetchall()
        for v in venues:
            print(v)

        print("\n--- USERS ---")
        cur.execute("SELECT id, first_name, last_name, role FROM users WHERE role IN ('manager', 'gestor', 'admin')")
        users = cur.fetchall()
        for u in users:
            print(u)

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_venues()
