import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_data_details():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            connect_timeout=2
        )
        print("CONNECTED TO MYSQL")
        with conn.cursor() as cursor:
            # Check Events Status
            cursor.execute("SELECT status, COUNT(*) FROM events GROUP BY status")
            status_counts = cursor.fetchall()
            print(f"Event Status Counts: {status_counts}")
            
            # Check Active Ads
            cursor.execute("SELECT active, COUNT(*) FROM ads GROUP BY active")
            active_counts = cursor.fetchall()
            print(f"Ad Active Counts: {active_counts}")
            
            # Sample published event
            cursor.execute("SELECT id, name, status FROM events WHERE status='published' LIMIT 1")
            sample_event = cursor.fetchone()
            print(f"Sample Published Event: {sample_event}")

            # Sample active ad
            cursor.execute("SELECT id, title, active FROM ads WHERE active=1 LIMIT 1")
            sample_ad = cursor.fetchone()
            print(f"Sample Active Ad: {sample_ad}")
            
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_data_details()
