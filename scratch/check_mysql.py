
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')

    try:
        conn = pymysql.connect(host=host, user=user, password=pwd, database=dbname)
        cur = conn.cursor()

        print(f"--- COLUMNS OF 'events' IN MYSQL ({dbname}) ---")
        cur.execute("DESCRIBE events")
        cols = cur.fetchall()
        for col in cols:
            print(col)

        print("\n--- VENUES COUNT ---")
        cur.execute("SELECT COUNT(*) FROM venues")
        print(cur.fetchone())

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_mysql()
