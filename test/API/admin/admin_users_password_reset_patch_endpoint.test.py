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
    doc = TestCaseDocumenter("CP-ADM-055", "admin_users_password_reset_patch_endpoint", "API / Admin",
                             level="API", test_type="Funcional / Seguridad", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PATCH /api/admin/users/{userId}/password",
                     "Garantizar reseteo administrativo de clave por el Administrador",
                     "Admin autenticado", "PATCH /api/admin/users/{userId}/password")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"pwd_reset_{int(time.time())}@laikaclub.com"
    r_create = requests.post(f"{GATEWAY_URL}/api/admin/users", json={"first_name": "PW", "last_name": "R", "email": unique_email, "password": "Password123!"}, headers=headers, timeout=10)
    user_id = r_create.json().get("user_id")

    url = f"{GATEWAY_URL}/api/admin/users/{user_id}/password"
    resp = requests.patch(url, json={"new_password": "NewAdminPassword123!"}, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "PATCH /password con new_password", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    # Limpieza
    if user_id:
        requests.delete(f"{GATEWAY_URL}/api/admin/users/{user_id}", headers=headers, timeout=5)

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
