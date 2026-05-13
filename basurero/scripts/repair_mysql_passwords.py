import pymysql
import bcrypt
import time
from datetime import datetime

# Configuración de conexión
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "laika_club"
}

# Cuentas a resetear
TARGET_EMAILS = [
    "admin@laikaclub.com",
    "gestor@laikaclub.com",
    "operador@laikaclub.com",
    "usuario@laikaclub.com"
]

NEW_PASSWORD = "admin123"

def get_password_hash(password):
    # Usar bcrypt directamente para asegurar compatibilidad
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def repair():
    print("--- Iniciando reparacion de credenciales en MySQL ---")
    
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 1. Generar nuevo hash
        print(f"Generando hash para '{NEW_PASSWORD}'...")
        new_hash = get_password_hash(NEW_PASSWORD)
        
        for email in TARGET_EMAILS:
            print(f"Procesando {email}...")
            
            # 2. Actualizar hash, limpiar fallos y desbloquear
            update_query = """
                UPDATE users 
                SET password_hash = %s, 
                    failed_attempts = 0, 
                    lockout_until = NULL,
                    status = 'active'
                WHERE email = %s
            """
            cursor.execute(update_query, (new_hash, email))
            
            if cursor.rowcount > 0:
                print(f"   [OK] {email} actualizado correctamente.")
            else:
                print(f"   [AVISO] {email} no encontrado en la base de datos.")
        
        conn.commit()
        print("\n--- Reparacion completada con exito ---")
        
    except Exception as e:
        print(f"\n❌ Error durante la reparación: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    repair()
