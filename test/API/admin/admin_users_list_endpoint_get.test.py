import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-049", "admin_users_list_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Directorio", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/admin/users",
                     "Garantizar respuesta HTTP 200 y listado de usuarios del sistema",
                     "Admin autenticado", "GET /api/admin/users")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?limit=5"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/admin/users", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    valid = "total" in data and "users" in data and isinstance(data["users"], list)
    doc.add_step(2, "Validar lista de usuarios", "users list válida", f"Total: {data.get('total')}", "✓" if valid else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "total": data.get("total")})
    success = status_ok and valid
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
