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
    doc = TestCaseDocumenter("CP-GES-013", "gestor_gateway_courtesy_quotas_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Tickets Service (/api/tickets/courtesy/my-quotas)",
                     "Verificar consulta de cuotas de cortesía para el gestor autenticado",
                     "Tickets Service activo", "GET /api/tickets/courtesy/my-quotas")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/my-quotas", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "Consultar cuotas de cortesías", "HTTP 200 con lista JSON", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("courtesy_quotas", {"status": resp.status_code, "data": resp.json() if ok else []})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
