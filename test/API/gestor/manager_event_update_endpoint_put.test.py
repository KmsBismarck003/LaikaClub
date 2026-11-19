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
    doc = TestCaseDocumenter("CP-GES-051", "manager_event_update_endpoint_put", "API / Gestor",
                             level="API", test_type="Funcional / Eventos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PUT /api/events/{id}",
                     "Validar actualización de metadatos de un evento",
                     "Evento ID 100001", "PUT /api/events/100001")
    doc.start()
    headers = get_gestor_auth_headers()
    payload = {"price": 1800.0, "description": "El festival más espectacular del año, con múltiples escenarios, activaciones de marca y la mejor música en vivo. No te pierdas esta experiencia única."}
    resp = requests.put(f"{GATEWAY_URL}/api/events/100001", headers=headers, json=payload, timeout=10)
    ok = resp.status_code == 200
    doc.add_step(1, "PUT /api/events/100001", "HTTP 200", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
