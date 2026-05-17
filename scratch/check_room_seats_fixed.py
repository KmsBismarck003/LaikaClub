import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_room_seats(room_id=1):
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        cur.execute("SELECT id, room_id, block_id, zone_id, seat_label FROM room_seats WHERE room_id = %s", (room_id,))
        seats = cur.fetchall()
        print(f"--- Seats for Room {room_id} ---")
        print(f"Total seats found: {len(seats)}")
        for s in seats[:10]:
            print(f"ID: {s['id']}, Label: {s['seat_label']}, Block: {s['block_id']}, Zone: {s['zone_id']}")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_room_seats(1)
    check_room_seats(3)
    check_room_seats(4)
    check_room_seats(5)
