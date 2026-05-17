import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_all_zones():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        cur.execute("SELECT r.id as room_id, r.name as room_name, COUNT(z.id) as zone_count FROM venue_rooms r LEFT JOIN seating_zones z ON r.id = z.room_id GROUP BY r.id")
        rooms = cur.fetchall()
        print(f"--- Rooms and Zone Counts ---")
        for r in rooms:
            print(f"Room ID: {r['room_id']}, Name: {r['room_name']}, Zones: {r['zone_count']}")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_all_zones()
