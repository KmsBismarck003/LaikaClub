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
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Tables in {os.getenv('MYSQL_DATABASE')}: {[t['Tables_in_laika_club'] for t in tables]}")
        
        for table in ['users', 'events']:
            if any(t['Tables_in_laika_club'] == table for t in tables):
                cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                res = cursor.fetchone()
                print(f"Table '{table}' has {res['count']} records.")
            else:
                print(f"Table '{table}' does NOT exist!")
    conn.close()
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
