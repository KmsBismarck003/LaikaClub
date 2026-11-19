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
    doc = TestCaseDocumenter("CP-ADM-056", "admin_users_unlock_patch_endpoint", "API / Admin",
                             level="API", test_type="Funcional / Operaciones", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PATCH /api/admin/users/{userId}/unlock",
                     "Garantizar desbloqueo administrativo de cuentas bloqueadas por fuerza bruta",
                     "Admin autenticado", "PATCH /api/admin/users/{userId}/unlock")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"unlock_test_{int(time.time())}@laikaclub.com"
    r_create = requests.post(f"{GATEWAY_URL}/api/admin/users", json={"first_name": "U", "last_name": "T", "email": unique_email, "password": "Password123!"}, headers=headers, timeout=10)
    user_id = r_create.json().get("user_id")

    url = f"{GATEWAY_URL}/api/admin/users/{user_id}/unlock"
    resp = requests.patch(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "PATCH /unlock", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    # Limpieza
    if user_id:
        requests.delete(f"{GATEWAY_URL}/api/admin/users/{user_id}", headers=headers, timeout=5)

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
