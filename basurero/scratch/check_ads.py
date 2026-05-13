
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_ads():
    print("--- Checking Ads Table ---")
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club')
        )
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT COUNT(*) FROM ads")
                print(f"Ads count: {cursor.fetchone()[0]}")
            except Exception as e:
                print(f"Ads table error: {e}")
        conn.close()
    except Exception as e:
        print(f"MySQL connection error: {e}")

if __name__ == "__main__":
    check_ads()
