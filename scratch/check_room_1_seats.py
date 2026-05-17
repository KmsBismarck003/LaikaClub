import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_room_1_seats():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        cur.execute("SELECT id, room_id, block_id, zone_id, seat_label, frontend_id FROM room_seats WHERE room_id = 1 LIMIT 10")
        seats = cur.fetchall()
        print(f"--- Seats for Room 1 ---")
        for s in seats:
            print(f"ID: {s['id']}, Label: {s['seat_label']}, FrontendID: {s['frontend_id']}")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_room_1_seats()
