import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_room_1():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        cur.execute("SELECT id, name, geometry_json FROM seating_zones WHERE room_id = 1")
        zones = cur.fetchall()
        print(f"--- Zones for Room 1 (sala1) ---")
        for z in zones:
            print(f"ID: {z['id']}, Name: {z['name']}, Geometry: {z['geometry_json'][:100]}...")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_room_1()
