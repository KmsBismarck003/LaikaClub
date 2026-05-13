import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_admin():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            # Buscar admins
            cursor.execute("SELECT id, first_name, email, role, status, failed_attempts, lockout_until FROM users WHERE role = 'admin'")
            admins = cursor.fetchall()
            
            if not admins:
                print("[INFO] No se encontraron usuarios con rol 'admin' en la base de datos MySQL.")
            else:
                print(f"[SUCCESS] Se encontraron {len(admins)} administradores:")
                for admin in admins:
                    print(f"---")
                    print(f"ID: {admin['id']}")
                    print(f"Nombre: {admin['first_name']}")
                    print(f"Email: {admin['email']}")
                    print(f"Status: {admin['status']}")
                    print(f"Intentos fallidos: {admin['failed_attempts']}")
                    print(f"Bloqueado hasta: {admin['lockout_until']}")

            # Listar últimos 5 fallos de auth (si existe la tabla auth_logs)
            try:
                cursor.execute("SELECT * FROM auth_logs ORDER BY created_at DESC LIMIT 5")
                logs = cursor.fetchall()
                if logs:
                    print("\n[LOGS] Ultimos eventos de autenticacion:")
                    for log in logs:
                        print(f"[{log.get('created_at')}] {log.get('event_type')} - {log.get('email')} - {log.get('summary')}")
            except Exception as e:
                print(f"\n[WARN] No se pudo leer auth_logs: {e}")

        conn.close()
    except Exception as e:
        print(f"[ERROR] Error conectando a MySQL: {e}")

if __name__ == "__main__":
    check_admin()
