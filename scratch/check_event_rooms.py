import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_event_rooms():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        cur.execute("""
            SELECT e.id as event_id, e.name as event_name, f.room_id, r.name as room_name 
            FROM events e 
            JOIN event_functions f ON e.id = f.event_id 
            LEFT JOIN venue_rooms r ON f.room_id = r.id
        """)
        events = cur.fetchall()
        print(f"--- Events and Assigned Rooms ---")
        for e in events:
            print(f"Event {e['event_id']} ({e['event_name']}) -> Room {e['room_id']} ({e['room_name']})")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_event_rooms()
