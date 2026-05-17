import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_venue_match():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
        )
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        # Event 5 Venue
        cur.execute("SELECT id, name, venue_id FROM events WHERE id = 5")
        event = cur.fetchone()
        print(f"Event 5 ({event['name']}) Venue ID: {event['venue_id']}")
        
        # Room 1 Venue
        cur.execute("SELECT id, name, venue_id FROM venue_rooms WHERE id = 1")
        room1 = cur.fetchone()
        print(f"Room 1 ({room1['name']}) Venue ID: {room1['venue_id']}")
        
        # Room 3 Venue
        cur.execute("SELECT id, name, venue_id FROM venue_rooms WHERE id = 3")
        room3 = cur.fetchone()
        print(f"Room 3 ({room3['name']}) Venue ID: {room3['venue_id']}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_venue_match()
