import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

def test_connection():
    try:
        connection = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "laika_club3_v2"),
            cursorclass=pymysql.cursors.DictCursor
        )
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Successfully connected to database: {os.getenv('MYSQL_DATABASE')}")
            print(f"Tables found: {len(tables)}")
            for table in tables:
                print(f" - {list(table.values())[0]}")
        connection.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
