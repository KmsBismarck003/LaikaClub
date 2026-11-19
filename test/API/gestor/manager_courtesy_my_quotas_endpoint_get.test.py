import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-062", "manager_courtesy_my_quotas_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Cortesías", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/tickets/courtesy/my-quotas",
                     "Validar consulta de cuotas asignadas al gestor autenticado",
                     "Gestor autenticado", "GET /api/tickets/courtesy/my-quotas")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/my-quotas", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "GET /api/tickets/courtesy/my-quotas", "HTTP 200 con array JSON", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "quotas": resp.json() if ok else []})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
