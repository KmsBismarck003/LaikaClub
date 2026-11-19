import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-066", "manager_venues_list_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Recintos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/venues",
                     "Validar listado de recintos disponibles para creación de eventos",
                     "Acceso a catálogo de recintos", "GET /api/venues")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/venues", timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "GET /api/venues", "HTTP 200 con array JSON", f"HTTP {resp.status_code}, total={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(resp.json()) if ok else 0})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
