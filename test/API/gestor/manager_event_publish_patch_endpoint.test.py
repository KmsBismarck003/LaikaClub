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
    doc = TestCaseDocumenter("CP-GES-052", "manager_event_publish_patch_endpoint", "API / Gestor",
                             level="API", test_type="Funcional / Eventos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PATCH /api/manager/events/{id}/publish",
                     "Validar publicación de evento",
                     "Evento ID 100001", "PATCH /api/manager/events/100001/publish")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.patch(f"{GATEWAY_URL}/api/manager/events/100001/publish", headers=headers, timeout=10)
    ok = resp.status_code == 200
    doc.add_step(1, "PATCH /api/manager/events/100001/publish", "HTTP 200", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
