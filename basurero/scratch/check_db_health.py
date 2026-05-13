import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            connect_timeout=2
        )
        print("SUCCESS: Connected to MySQL")
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Tables: {tables}")
            
            cursor.execute("SELECT COUNT(*) FROM ads")
            ads_count = cursor.fetchone()[0]
            print(f"Ads count: {ads_count}")
            
            cursor.execute("SELECT COUNT(*) FROM events")
            events_count = cursor.fetchone()[0]
            print(f"Events count: {events_count}")
            
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_mysql()
