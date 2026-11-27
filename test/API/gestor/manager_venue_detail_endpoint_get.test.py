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
    doc = TestCaseDocumenter("CP-GES-067", "manager_venue_detail_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Recintos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/venues/{id}",
                     "Validar consulta de información detallada de recinto ID 12",
                     "Recinto ID 12", "GET /api/venues/12")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/venues/12", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and data.get("id") == 12
    doc.add_step(1, "GET /api/venues/12", "HTTP 200 con id 12", f"HTTP {resp.status_code}, name='{data.get('name')}'", "✓" if ok else "✗")
    if not ok:
        doc.set_defect("DEF-GES-004", "Media", "Falta endpoint GET /venues/{id} en VenueController: responde HTTP 405 Method Not Allowed")
    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
