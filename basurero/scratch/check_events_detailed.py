import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "laika_club"),
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cursor:
        cursor.execute("SELECT status, COUNT(*) as count FROM events GROUP BY status")
        results = cursor.fetchall()
        print("Events by status:")
        for row in results:
            print(f"- {row['status']}: {row['count']}")
            
        cursor.execute("SELECT id, name, status FROM events LIMIT 5")
        samples = cursor.fetchall()
        print("\nSample events:")
        for row in samples:
            print(f"- ID {row['id']}: {row['name']} ({row['status']})")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
