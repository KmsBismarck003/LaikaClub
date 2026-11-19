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
    doc = TestCaseDocumenter("CP-GES-054", "manager_event_functions_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Funciones", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/events/{id}/functions",
                     "Validar obtención de fechas y horarios programados del evento",
                     "Evento ID 100001", "GET /api/events/100001/functions")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/events/100001/functions", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "GET /api/events/100001/functions", "HTTP 200 con array JSON", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    if not ok:
        doc.set_defect("DEF-GES-002", "Media", "Endpoint /api/events/{id}/functions responde HTTP 404 a pesar de estar mapeado en el backend")
    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
