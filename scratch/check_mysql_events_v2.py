import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_mysql_events():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor()
        cur.execute("SELECT id, name, status, created_by FROM events")
        rows = cur.fetchall()
        print(f"Found {len(rows)} events in MySQL:")
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}, Status: {row[2]}, CreatedBy: {row[3]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_mysql_events()
