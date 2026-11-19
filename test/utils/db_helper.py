"""
Helper de conexión y consultas a MySQL para pruebas de persistencia, integridad y base de datos.
Permite validar estados reales en bases de datos sin mocks.
"""
import os
import pymysql

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")

def get_connection(db_name="laika_auth"):
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=db_name,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def execute_query(db_name, query, params=None):
    with get_connection(db_name) as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.fetchall()

def execute_single(db_name, query, params=None):
    res = execute_query(db_name, query, params)
    return res[0] if res else None
