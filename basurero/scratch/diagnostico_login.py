"""
DIAGNÓSTICO DE LOGIN - Laika Club
Checa usuarios en MySQL y SQLite, y desbloquea cuentas bloqueadas.
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

import sqlite3
from pathlib import Path

# ─── SQLite ───────────────────────────────────────────────────────────────────
DB_PATH = Path(__file__).parent.parent / 'microservices' / 'auth' / 'auth.db'

print("=" * 60)
print("  DIAGNÓSTICO DE AUTENTICACIÓN - LAIKA CLUB")
print("=" * 60)

print("\n[1/3] Revisando usuarios en SQLite (auth.db)...")
if DB_PATH.exists():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, email, role, status, failed_attempts, lockout_until FROM users ORDER BY role")
    rows = c.fetchall()
    print(f"  Encontrados: {len(rows)} usuarios")
    for r in rows:
        locked = "🔒 BLOQUEADO" if r[5] else ""
        print(f"  [{r[3]}] {r[2]:12} | {r[1]:40} | intentos={r[4]} {locked}")
    conn.close()
else:
    print("  auth.db no encontrada.")

# ─── MySQL ────────────────────────────────────────────────────────────────────
print("\n[2/3] Revisando usuarios en MySQL...")
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASS = os.getenv('MYSQL_PASSWORD', '')
MYSQL_DB   = os.getenv('MYSQL_DATABASE', 'laika_club')

try:
    import pymysql
    conn_m = pymysql.connect(
        host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASS,
        database=MYSQL_DB, connect_timeout=5
    )
    cursor = conn_m.cursor()
    cursor.execute("SELECT id, email, role, status, failed_attempts, lockout_until FROM users ORDER BY role")
    rows_m = cursor.fetchall()
    print(f"  Encontrados: {len(rows_m)} usuarios en MySQL")
    for r in rows_m:
        locked = "🔒 BLOQUEADO" if r[5] else ""
        has_pass_q = "SELECT password_hash FROM users WHERE id=%s"
        cursor.execute(has_pass_q, (r[0],))
        ph = cursor.fetchone()[0]
        no_pass = "❌ SIN CONTRASEÑA" if not ph else ""
        print(f"  [{r[3]}] {r[2]:12} | {r[1]:40} | intentos={r[4]} {locked} {no_pass}")
    
    # Desbloquear automáticamente todas las cuentas bloqueadas por intentos
    print("\n[3/3] Desbloqueando cuentas con lockout en MySQL...")
    cursor.execute("""
        UPDATE users 
        SET failed_attempts = 0, lockout_until = NULL 
        WHERE lockout_until IS NOT NULL OR failed_attempts >= 3
    """)
    conn_m.commit()
    affected = cursor.rowcount
    print(f"  ✅ {affected} cuenta(s) desbloqueada(s) en MySQL.")
    conn_m.close()

except ImportError:
    print("  ⚠️  pymysql no instalado. Ejecuta: pip install pymysql")
except Exception as e:
    print(f"  ❌ Error conectando a MySQL: {e}")
    print("  (Puede que MySQL no esté corriendo o las credenciales sean incorrectas)")

# ─── SQLite - Desbloquear ─────────────────────────────────────────────────────
if DB_PATH.exists():
    print("\nDesbloqueando cuentas con lockout en SQLite...")
    conn2 = sqlite3.connect(DB_PATH)
    c2 = conn2.cursor()
    c2.execute("UPDATE users SET failed_attempts=0, lockout_until=NULL WHERE lockout_until IS NOT NULL OR failed_attempts >= 3")
    conn2.commit()
    print(f"  ✅ {c2.rowcount} cuenta(s) desbloqueada(s) en SQLite.")
    conn2.close()

print("\n" + "=" * 60)
print("  DIAGNÓSTICO COMPLETADO")
print("  Si el problema persiste, verifica que:")
print("  1. Los usuarios con rol 'usuario' existan en MySQL.")
print("  2. Sus contraseñas estén hasheadas con bcrypt.")
print("  3. Google OAuth: comprueba la consola de Google.")
print("=" * 60)
