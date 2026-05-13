import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def drop_all_tables():
    print("[*] Connecting to MySQL to clear the database...")
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "laika_club")
        )
        with conn.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            for (table,) in tables:
                print(f"[*] Dropping table {table}...")
                cursor.execute(f"DROP TABLE `{table}`")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()
        conn.close()
        print("[DONE] All tables dropped.")
    except Exception as e:
        print(f"[❌] Error: {e}")

if __name__ == "__main__":
    drop_all_tables()
