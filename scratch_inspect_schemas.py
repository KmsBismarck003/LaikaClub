import os
import sqlite3
import pymysql
from dotenv import load_dotenv

load_dotenv()

def print_columns_sqlite(db_path, table_name):
    if not os.path.exists(db_path):
        return
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute(f"PRAGMA table_info({table_name})")
        cols = cur.fetchall()
        print(f"SQLite [{db_path}] -> Table [{table_name}] columns:")
        for c in cols:
            print(f"  {c[1]} ({c[2]})")
    except Exception as e:
        print(f"Error reading SQLite table {table_name}: {e}")
    finally:
        conn.close()

def print_columns_mysql(table_name):
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")
    
    conn = None
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password="root" if not password else password,
            database=database
        )
    except Exception as e:
        print(f"MySQL connection failed: {e}")
        return
    
    cur = conn.cursor()
    try:
        cur.execute(f"DESCRIBE {table_name}")
        cols = cur.fetchall()
        print(f"MySQL -> Table [{table_name}] columns:")
        for c in cols:
            print(f"  {c[0]} ({c[1]})")
    except Exception as e:
        print(f"Error reading MySQL table {table_name}: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print_columns_sqlite("microservices/auth/auth.db", "users")
    print_columns_sqlite("microservices/events/events.db", "venues")
    print_columns_sqlite("microservices/events/events.db", "events")
    print()
    print_columns_mysql("users")
    print_columns_mysql("venues")
    print_columns_mysql("events")
