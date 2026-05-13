import os
import pymysql
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

# Configuración de Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def fix_database():
    print("--- FIX DATABASE: LAIKA CLUB ---")
    
    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    try:
        conn = pymysql.connect(host=host, user=user, password=pwd, database=dbname)
        cursor = conn.cursor()
        
        # 1. Crear auth_logs si no existe
        print("[*] Verificando tabla 'auth_logs'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(255),
                email VARCHAR(191),
                role VARCHAR(50),
                event_type VARCHAR(100),
                ip_address VARCHAR(50),
                user_agent TEXT,
                summary TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        # 2. Crear permission_requests si no existe
        print("[*] Verificando tabla 'permission_requests'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS permission_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                permission_type VARCHAR(100),
                status VARCHAR(20) DEFAULT 'pending',
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        # 3. Resetear contraseña de Admin
        print("[*] Reseteando contraseña de admin@laikaclub.com -> admin123")
        new_hash = pwd_context.hash("admin123")
        cursor.execute("""
            UPDATE users SET password_hash = %s, failed_attempts = 0, lockout_until = NULL 
            WHERE email = 'admin@laikaclub.com'
        """, (new_hash,))
        
        if cursor.rowcount == 0:
            print("[!] ADVERTENCIA: No se encontró al usuario admin@laikaclub.com en MySQL.")
        else:
            print("[OK] Contraseña reseteada exitosamente.")

        conn.commit()
        cursor.close()
        conn.close()
        print("\n[EXITO] Base de datos estabilizada.")
        
    except Exception as e:
        print(f"\n[ERROR] Fallo al estabilizar DB: {e}")

if __name__ == "__main__":
    fix_database()
