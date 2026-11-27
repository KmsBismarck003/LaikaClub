import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-036", "rbac_rechazo_usuario_regular_en_admin_users_security", "SECURITY / Admin",
                             level="SECURITY", test_type="Seguridad / Control de Acceso", technique="Caja negra")
    doc.set_metadata("Comprobar que un usuario con rol regular 'usuario' sea estrictamente RECHAZADO al invocar /api/admin/users",
                     "Garantizar principio de mínimo privilegio (OWASP Top 10 A01: Broken Access Control)",
                     "Token válido de usuario ordinario", "GET /api/admin/users")
    doc.start()
    user_headers = get_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users"
    resp = requests.get(url, headers=user_headers, timeout=10)
    # Debe ser rechazado (401, 403 o 500 con Access Denied)
    is_rejected = resp.status_code in [401, 403, 500] and ("Access Denied" in resp.text or resp.status_code in [401, 403])
    doc.add_step(1, "Usuario ordinario invoca /api/admin/users", "Acceso denegado", f"HTTP {resp.status_code} ({resp.text[:60]})", "✓" if is_rejected else "✗")

    doc.attach_evidence("rbac_defense", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if is_rejected else "Fallida",
               observations="El microservicio rechaza el acceso denegando la petición al no tener rol 'admin'")
    return doc.result

if __name__ == "__main__":
    run_test()
