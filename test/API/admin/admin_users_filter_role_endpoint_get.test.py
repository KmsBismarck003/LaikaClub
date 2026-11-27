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
    doc = TestCaseDocumenter("CP-ADM-050", "admin_users_filter_role_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Filtros", technique="Caja negra")
    doc.set_metadata("Comprobar parámetro ?role=gestor en GET /api/admin/users",
                     "Validar que solo se retornen usuarios con rol 'gestor'",
                     "Admin autenticado", "GET /api/admin/users?role=gestor")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?role=gestor&limit=5"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/admin/users?role=gestor", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    users = data.get("users", [])
    matches = all(u.get("role") == "gestor" for u in users) if users else True
    doc.add_step(2, "Verificar roles devueltos", "Todos 'gestor'", f"Total: {len(users)}, match={matches}", "✓" if matches else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(users)})
    success = status_ok and matches
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
