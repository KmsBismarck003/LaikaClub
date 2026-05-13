import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Añadir el path raíz para importar microservicios si es necesario
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def seed_logs():
    print("[INFO] Sembrando registros del sistema...")
    
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    MYSQL_URL = f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}"
    
    try:
        engine = create_engine(MYSQL_URL)
        with engine.connect() as conn:
            # Asegurar tabla en MySQL
            conn.execute(text("DROP TABLE IF EXISTS alert_log")).execution_options(autocommit=True)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS alert_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    level VARCHAR(20) DEFAULT 'info',
                    message TEXT,
                    service VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address VARCHAR(45),
                    device_os VARCHAR(50),
                    browser VARCHAR(50)
                )
            """).execution_options(autocommit=True))
            
            # Limpiar logs previos
            conn.execute(text("DELETE FROM alert_log"))
            conn.commit()
            
            logs = [
                ("SUCCESS", "Reactivación masiva de microservicios verificada.", "Pasarela de Red", 2, "192.168.1.1", "Linux", "Chrome", "ADMIN", "admin@laikaclub.com"),
                ("INFO", "Inicio de sesión administrativo", "Servicio de Autenticación", 4, "192.168.1.100", "Windows 11", "Chrome", "ADMIN", "admin@laikaclub.com"),
                ("SUCCESS", "Base de datos restaurada mediante Plan de Invierno.", "Gestor de Base de Datos", 10, "127.0.0.1", "Linux Server", "System", "GESTOR", "gestor@laikaclub.com"),
                ("ERROR", "Fallo crítico en sincronización de inventario.", "Resiliencia del Sistema", 15, "10.0.0.5", "Ubuntu 22.04", "Python", "SISTEMA", ""),
                ("WARN", "Intento de acceso fallido (Usuario: gestor)", "Servicio de Autenticación", 20, "192.168.1.102", "Android 13", "Chrome Mobile", "GESTOR", "gestor@laikaclub.com"),
                ("INFO", "Actualización de stock 'Laika Shop'", "Servicio de Mercancía", 25, "10.0.0.8", "Windows 10", "Edge", "OPERADOR", "operador@laikaclub.com"),
                ("SUCCESS", "Mantenimiento preventivo completado.", "Tarea de Mantenimiento", 30, "127.0.0.1", "Linux Server", "Cron", "SISTEMA", ""),
                ("INFO", "Motor Spark inicializado para Analytics.", "Motor de Analítica", 45, "10.0.0.12", "MacOS Sonoma", "Safari", "GESTOR", "analitica@laikaclub.com"),
                ("WARN", "Latencia elevada en MongoDB (250ms)", "Servicio de Estadísticas", 50, "10.0.0.15", "Linux Server", "System", "SISTEMA", ""),
                ("INFO", "Servicio iniciado en puerto 8004", "Servicio de Estadísticas", 60, "127.0.0.1", "Linux Server", "System", "SISTEMA", ""),
            ]
            
            for level, message, service, mins_ago, ip, os_val, browser, role, email in logs:
                ts = datetime.now() - timedelta(minutes=mins_ago)
                conn.execute(text("""
                    INSERT INTO alert_log (level, message, service, created_at, ip_address, device_os, browser, user_role, user_email)
                    VALUES (:lvl, :msg, :svc, :ts, :ip, :os, :browser, :role, :email)
                """), {
                    "lvl": level,
                    "msg": message,
                    "svc": service,
                    "ts": ts,
                    "ip": ip,
                    "os": os_val,
                    "browser": browser,
                    "role": role,
                    "email": email
                })
            
            conn.commit()
            print("[SUCCESS] Se han inyectado 10 registros de auditoría en MySQL.")
            
    except Exception as e:
        print(f"[ERROR] Error al sembrar logs en MySQL: {e}")
        print("[INFO] Intentando sembrar en SQLite local...")
        try:
            import sqlite3
            db_path = "microservices/stats/stats.db"
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            
            # Limpiar previos
            cur.execute("DROP TABLE IF EXISTS alert_log")
            
            # Recrear con IP y Device metadata
            cur.execute("""
                CREATE TABLE alert_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT DEFAULT 'info',
                    message TEXT,
                    service TEXT,
                    created_at TIMESTAMP,
                    ip_address TEXT,
                    device_os TEXT,
                    browser TEXT,
                    user_role TEXT,
                    user_email TEXT
                )
            """)
            
            logs = [
                ("SUCCESS", "Reactivación masiva de microservicios verificada.", "Pasarela de Red", 2, "192.168.1.1", "Linux", "Chrome", "ADMIN", "admin@laikaclub.com"),
                ("INFO", "Inicio de sesión administrativo", "Servicio de Autenticación", 4, "192.168.1.100", "Windows 11", "Chrome", "ADMIN", "admin@laikaclub.com"),
                ("SUCCESS", "Base de datos restaurada mediante Plan de Invierno.", "Gestor de Base de Datos", 10, "127.0.0.1", "Linux Server", "System", "GESTOR", "gestor@laikaclub.com"),
                ("ERROR", "Fallo crítico en sincronización de inventario.", "Resiliencia del Sistema", 15, "10.0.0.5", "Ubuntu 22.04", "Python", "SISTEMA", ""),
                ("WARN", "Intento de acceso fallido (Usuario: gestor)", "Servicio de Autenticación", 20, "192.168.1.102", "Android 13", "Chrome Mobile", "GESTOR", "gestor@laikaclub.com"),
                ("INFO", "Actualización de stock 'Laika Shop'", "Servicio de Mercancía", 25, "10.0.0.8", "Windows 10", "Edge", "OPERADOR", "operador@laikaclub.com"),
                ("SUCCESS", "Mantenimiento preventivo completado.", "Tarea de Mantenimiento", 30, "127.0.0.1", "Linux Server", "Cron", "SISTEMA", ""),
                ("INFO", "Motor Spark inicializado para Analytics.", "Motor de Analítica", 45, "10.0.0.12", "MacOS Sonoma", "Safari", "GESTOR", "analitica@laikaclub.com"),
                ("WARN", "Latencia elevada en MongoDB (250ms)", "Servicio de Estadísticas", 50, "10.0.0.15", "Linux Server", "System", "SISTEMA", ""),
                ("INFO", "Servicio iniciado en puerto 8004", "Servicio de Estadísticas", 60, "127.0.0.1", "Linux Server", "System", "SISTEMA", ""),
            ]
            
            for level, message, service, mins_ago, ip, os_val, browser, role, email in logs:
                ts = (datetime.now() - timedelta(minutes=mins_ago)).strftime('%Y-%m-%d %H:%M:%S')
                cur.execute("""
                    INSERT INTO alert_log (level, message, service, created_at, ip_address, device_os, browser, user_role, user_email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (level, message, service, ts, ip, os_val, browser, role, email))
            
            conn.commit()
            conn.close()
            print("[SUCCESS] Se han inyectado 10 registros de auditoría en SQLite.")
        except Exception as e2:
            print(f"[CRITICAL] No se pudo sembrar en ninguna base de datos: {e2}")

if __name__ == "__main__":
    seed_logs()
