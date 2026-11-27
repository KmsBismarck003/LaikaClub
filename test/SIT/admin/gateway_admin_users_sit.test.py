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
    doc = TestCaseDocumenter("CP-ADM-010", "gateway_admin_users_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar integración Gateway -> Auth para /api/admin/users",
                     "Garantizar que el gateway reenvía la consulta con cabecera Bearer y responde usuarios",
                     "Admin autenticado con token válido", "GET /api/admin/users?limit=5")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?limit=5"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/admin/users a través de Gateway", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_keys = "total" in data and "users" in data
    doc.add_step(2, "Verificar estructura JSON de respuesta", "Keys total y users presentes", f"Total: {data.get('total', 0)}", "✓" if has_keys else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "total": data.get("total")})
    success = status_ok and has_keys
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
