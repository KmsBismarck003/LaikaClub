
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def fix_venue_rooms():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')

    try:
        conn = pymysql.connect(host=host, user=user, password=pwd, database=dbname)
        cur = conn.cursor()

        # Check if rooms exist for Venue 2
        cur.execute("SELECT id FROM venue_rooms WHERE venue_id = 2")
        if not cur.fetchone():
            print("Adding rooms to Venue 2...")
            cur.execute("""
                INSERT INTO venue_rooms (venue_id, name, capacity, status, layout_mode)
                VALUES (2, 'Sala Principal', 500, 'active', 'general_admission'),
                       (2, 'VIP Lounge', 50, 'active', 'general_admission')
            """)
            conn.commit()
            print("Rooms added successfully.")
        else:
            print("Venue 2 already has rooms.")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_venue_rooms()
