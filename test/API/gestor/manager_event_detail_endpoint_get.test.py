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
    doc = TestCaseDocumenter("CP-GES-050", "manager_event_detail_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Eventos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/events/{id}",
                     "Validar consulta de detalle de evento por ID",
                     "Evento ID 100001", "GET /api/events/100001")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/events/100001", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and data.get("id") == 100001
    doc.add_step(1, "GET /api/events/100001", "HTTP 200 con id 100001", f"HTTP {resp.status_code}, name='{data.get('name')}'", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "name": data.get("name")})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
