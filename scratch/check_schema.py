import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_schema():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor()
        
        tables = ['seating_zones', 'seating_blocks', 'room_seats']
        for table in tables:
            print(f"\n--- Columns in {table} ---")
            cur.execute(f"DESCRIBE {table}")
            cols = cur.fetchall()
            for c in cols:
                print(f"  {c[0]} ({c[1]})")
                
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
