"""
MIGRACIÓN DE MYSQL - Agrega columnas faltantes en la tabla users.
Columnas que SQLite tiene pero MySQL no: social_provider, reset_token, 
reset_token_expires, permissions, is_premium, premium_until, avatar_url
"""
import os, pymysql
from dotenv import load_dotenv
load_dotenv('.env')

conn = pymysql.connect(
    host=os.getenv('MYSQL_HOST','localhost'),
    user=os.getenv('MYSQL_USER','root'),
    password=os.getenv('MYSQL_PASSWORD',''),
    database=os.getenv('MYSQL_DATABASE','laika_club'),
    connect_timeout=5
)
c = conn.cursor()

# Obtener columnas actuales
c.execute("SHOW COLUMNS FROM users")
existing = {row[0] for row in c.fetchall()}
print("Columnas actuales en MySQL users:", existing)

# Columnas necesarias para que el auth service funcione 
needed = [
    ("social_provider",       "VARCHAR(50) DEFAULT NULL"),
    ("reset_token",           "VARCHAR(10) DEFAULT NULL"),
    ("reset_token_expires",   "DATETIME DEFAULT NULL"),
    ("permissions",           "TEXT DEFAULT NULL"),
    ("is_premium",            "TINYINT(1) DEFAULT 0"),
    ("premium_until",         "DATETIME DEFAULT NULL"),
    ("avatar_url",            "VARCHAR(500) DEFAULT NULL"),
]

for col_name, col_def in needed:
    if col_name not in existing:
        sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"
        c.execute(sql)
        conn.commit()
        print(f"  AGREGADA: {col_name}")
    else:
        print(f"  Ya existe: {col_name}")

# Verificar que alert_log exista (para que auth logs funcionen)
c.execute("""
    CREATE TABLE IF NOT EXISTS alert_log (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        level       VARCHAR(20),
        message     TEXT,
        service     VARCHAR(100),
        created_at  DATETIME DEFAULT NOW(),
        ip_address  VARCHAR(50),
        device_os   VARCHAR(50),
        browser     VARCHAR(50),
        user_role   VARCHAR(50),
        user_email  VARCHAR(200)
    )
""")
conn.commit()
print("Tabla alert_log: OK")

# Verificar auth_logs
c.execute("""
    CREATE TABLE IF NOT EXISTS auth_logs (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT,
        user_name  VARCHAR(200),
        email      VARCHAR(200),
        role       VARCHAR(50),
        event_type VARCHAR(100),
        ip_address VARCHAR(50),
        user_agent TEXT,
        summary    TEXT,
        created_at DATETIME DEFAULT NOW()
    )
""")
conn.commit()
print("Tabla auth_logs: OK")

conn.close()
print("\nMigracion completada. Reinicia el auth service.")
