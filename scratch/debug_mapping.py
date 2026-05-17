import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def debug_mapping():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        # Check events
        cur.execute("SELECT id, name FROM events LIMIT 5")
        events = cur.fetchall()
        print(f"--- Events ---")
        for e in events:
            print(f"ID: {e['id']}, Name: {e['name']}")
            
        # Check functions for event 5 (from user screenshot)
        cur.execute("SELECT id, event_id, room_id, venue_id FROM event_functions WHERE event_id = 5")
        funcs = cur.fetchall()
        print(f"\n--- Functions for Event 5 ---")
        for f in funcs:
            print(f"ID: {f['id']}, RoomID: {f['room_id']}, VenueID: {f['venue_id']}")
            
        if funcs:
            room_id = funcs[0]['room_id']
            if room_id:
                # Check room map
                cur.execute("SELECT id, name FROM seating_zones WHERE room_id = %s", (room_id,))
                zones = cur.fetchall()
                print(f"\n--- Zones for Room {room_id} ---")
                print(f"Found {len(zones)} zones")
                for z in zones:
                    print(f"  Zone: {z['name']}")
            else:
                print("\nWARNING: No room_id assigned to function.")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_mapping()
