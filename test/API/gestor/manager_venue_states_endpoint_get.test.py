import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-070", "manager_venue_states_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Ubicaciones", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/venues/locations/states/{country_id}",
                     "Validar consulta geográfica de estados por país ID 1",
                     "País ID 1", "GET /api/venues/locations/states/1")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/venues/locations/states/1", timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "GET /api/venues/locations/states/1", "HTTP 200 con lista de estados", f"HTTP {resp.status_code}, total={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(resp.json()) if ok else 0})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
