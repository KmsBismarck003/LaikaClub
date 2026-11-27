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
    doc = TestCaseDocumenter("CP-GES-063", "manager_courtesy_event_dashboard_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Cortesías", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/tickets/courtesy/event/{eventId}",
                     "Validar entrega de dashboard de cortesías de un evento específico",
                     "Evento ID 100001", "GET /api/tickets/courtesy/event/100001")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/event/100001", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "totalQuotaAllowed" in data
    doc.add_step(1, "GET /api/tickets/courtesy/event/100001", "HTTP 200 con totalQuotaAllowed", f"HTTP {resp.status_code}, allowed={data.get('totalQuotaAllowed')}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
