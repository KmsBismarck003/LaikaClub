import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "laika_club")
    )
    with conn.cursor() as cursor:
        print("Updating events from 'draft' to 'published'...")
        affected = cursor.execute("UPDATE events SET status = 'published' WHERE status = 'draft'")
        conn.commit()
        print(f"Update complete. {affected} events updated.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
