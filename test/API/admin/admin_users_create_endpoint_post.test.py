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

def run_test():
    doc = TestCaseDocumenter("CP-ADM-053", "admin_users_create_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / Creación", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/admin/users para alta de usuarios",
                     "Garantizar respuesta HTTP 200 con user_id asignado",
                     "Admin autenticado", "POST /api/admin/users")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"temp_user_{int(time.time())}@laikaclub.com"
    payload = {
        "first_name": "API",
        "last_name": "TestUser",
        "email": unique_email,
        "password": "Password123!",
        "role": "usuario",
        "phone": "5551234567"
    }
    url = f"{GATEWAY_URL}/api/admin/users"
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "POST /api/admin/users", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    user_id = data.get("user_id")
    has_id = bool(user_id)
    doc.add_step(2, "Verificar user_id en respuesta", "user_id no nulo", f"user_id={user_id}", "✓" if has_id else "✗")

    # Limpieza
    if user_id:
        requests.delete(f"{GATEWAY_URL}/api/admin/users/{user_id}", headers=headers, timeout=5)

    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    success = status_ok and has_id
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
