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
    doc = TestCaseDocumenter("CP-ADM-013", "gateway_admin_b2b_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar integración Gateway -> Admin para módulo B2B organizaciones",
                     "Verificar listado de organizaciones aliadas a través del gateway",
                     "Admin autenticado", "GET /api/b2b/organizations")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/b2b/organizations"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/b2b/organizations", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else []
    is_list = isinstance(data, list)
    doc.add_step(2, "Verificar retorno de organizaciones", "Tipo lista JSON", f"Elementos: {len(data)}", "✓" if is_list else "✗")

    doc.attach_evidence("b2b_response", {"status": resp.status_code, "count": len(data)})
    success = status_ok and is_list
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
