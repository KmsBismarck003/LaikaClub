import os
import pymysql
from dotenv import load_dotenv
from pathlib import Path

# Load env variables
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_connection():
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")
    
    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def execute_query(query, params=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            if params is None:
                cursor.execute(query)
            else:
                cursor.execute(query, params)
            return cursor.fetchall()
    finally:
        conn.close()

def execute_update(query, params=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            if params is None:
                cursor.execute(query)
            else:
                cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
    finally:
        conn.close()
