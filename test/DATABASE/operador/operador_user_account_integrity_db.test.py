import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import pymysql
from config.test_config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-060", "operador_user_account_integrity_db", "DATABASE / Operador",
                             level="DATABASE", test_type="Base de Datos / Autenticación", technique="Caja blanca")
    doc.set_metadata("Validar en laika_auth.users que operador@laikaclub.com tenga rol operador y status active.",
                     "Comprobar integridad de cuenta staff, permisos canValidateTickets y BCrypt hash",
                     "Base de datos laika_auth disponible", "Usuario: operador@laikaclub.com")
    doc.start()
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="laika_auth",
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, email, role, status, password_hash, permissions FROM users WHERE email = %s", ("operador@laikaclub.com",))
            user = cursor.fetchone()
            assert user is not None, "Cuenta operador@laikaclub.com no encontrada en base de datos"
            assert user["role"] == "operador", f"Rol discrepante: {user['role']}"
            assert user["status"] == "active", f"Status inactivo: {user['status']}"
            assert user["password_hash"].startswith("$2"), "Password no posee formato BCrypt válido"
            assert "canValidateTickets" in user["permissions"], "Falta permiso canValidateTickets en cuenta de operador"
            
        conn.close()
        
        doc.add_step(1, "Verificar cuenta de operador en MySQL", "Rol operador y status active", f"ID={user['id']}, role={user['role']}, status={user['status']}", "✓")
        doc.attach_evidence("db_operador_user", {"id": user["id"], "email": user["email"], "role": user["role"], "status": user["status"]})
        doc.finish("Aprobada", observations=f"Usuario ID={user['id']}, Email={user['email']}, Rol={user['role']}, Status={user['status']}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
