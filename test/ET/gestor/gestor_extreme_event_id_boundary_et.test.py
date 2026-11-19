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
    doc = TestCaseDocumenter("CP-GES-045", "gestor_extreme_event_id_boundary_et", "ET / Gestor",
                             level="ET", test_type="Exploratorio / Límites", technique="Caja negra")
    doc.set_metadata("Explorar comportamiento ante ID de evento no existente (99999999)",
                     "Garantizar que el sistema no colapse ante identificadores fuera de rango",
                     "ID = 99999999", "GET /api/manager/events/99999999/tickets")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events/99999999/tickets", headers=headers, timeout=10)
    handled = resp.status_code in [200, 404]
    doc.add_step(1, "Consultar boletos de ID 99999999", "Manejo controlado (HTTP 200 vacío o 404)", f"HTTP {resp.status_code}", "✓" if handled else "✗")
    doc.attach_evidence("extreme_id_et", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
