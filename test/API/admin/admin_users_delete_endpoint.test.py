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
    doc = TestCaseDocumenter("CP-ADM-057", "admin_users_delete_endpoint", "API / Admin",
                             level="API", test_type="Funcional / Eliminación", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint DELETE /api/admin/users/{userId}",
                     "Garantizar baja física o lógica de un usuario del sistema",
                     "Admin autenticado", "DELETE /api/admin/users/{userId}")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"del_user_{int(time.time())}@laikaclub.com"
    r_create = requests.post(f"{GATEWAY_URL}/api/admin/users", json={"first_name": "D", "last_name": "U", "email": unique_email, "password": "Password123!"}, headers=headers, timeout=10)
    user_id = r_create.json().get("user_id")

    url = f"{GATEWAY_URL}/api/admin/users/{user_id}"
    resp = requests.delete(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "DELETE /api/admin/users/{userId}", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
