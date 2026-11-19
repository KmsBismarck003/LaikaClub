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
    doc = TestCaseDocumenter("CP-ADM-052", "admin_users_search_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Búsqueda", technique="Caja negra")
    doc.set_metadata("Comprobar búsqueda por texto ?search=admin en GET /api/admin/users",
                     "Validar que el motor de búsqueda encuentre registros coincidentes",
                     "Admin autenticado", "GET /api/admin/users?search=admin")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?search=admin&limit=5"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/admin/users?search=admin", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    users = data.get("users", [])
    found = len(users) > 0
    doc.add_step(2, "Verificar resultados de búsqueda", "Resultados >= 1", f"Encontrados: {len(users)}", "✓" if found else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(users)})
    success = status_ok and found
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
