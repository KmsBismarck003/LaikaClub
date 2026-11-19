import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-085", "admin_persistencia_usuario_creado_db", "DATABASE / Admin",
                             level="DATABASE", test_type="Persistencia Relacional", technique="Caja gris")
    doc.set_metadata("Comprobar persistencia física en MySQL de usuario creado por el Administrador",
                     "Garantizar que la fila exista en la tabla users de la base laika_auth con el rol correcto",
                     "MySQL 8.0 conexión directa", "Tabla laika_auth.users")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"db_admin_create_{int(time.time())}@laikaclub.com"
    r_create = requests.post(f"{GATEWAY_URL}/api/admin/users", json={"first_name": "DB", "last_name": "Test", "email": unique_email, "password": "Password123!", "role": "gestor"}, headers=headers, timeout=10)
    user_id = r_create.json().get("user_id")
    doc.add_step(1, "Crear usuario vía API", "user_id no nulo", f"user_id={user_id}", "✓" if user_id else "✗")

    rows = execute_query("laika_auth", "SELECT id, email, role, status FROM users WHERE id = %s;", (user_id,)) if user_id else []
    persisted = len(rows) == 1 and rows[0]["email"] == unique_email and rows[0]["role"] == "gestor"
    doc.add_step(2, "Verificar fila física en MySQL", "Fila existe con role=='gestor'", f"Encontrado: {rows}", "✓" if persisted else "✗")

    if user_id:
        requests.delete(f"{GATEWAY_URL}/api/admin/users/{user_id}", headers=headers, timeout=5)

    doc.attach_evidence("db_persistence", {"user_id": user_id, "row": rows[0] if rows else {}})
    success = bool(user_id) and persisted
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
