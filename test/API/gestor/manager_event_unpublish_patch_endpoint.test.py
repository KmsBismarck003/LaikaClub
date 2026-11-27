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
    doc = TestCaseDocumenter("CP-GES-053", "manager_event_unpublish_patch_endpoint", "API / Gestor",
                             level="API", test_type="Funcional / Eventos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PATCH /api/manager/events/{id}/unpublish",
                     "Validar retiro de publicación temporal de evento (mover a borrador)",
                     "Evento ID 100001", "PATCH /api/manager/events/100001/unpublish")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.patch(f"{GATEWAY_URL}/api/manager/events/100001/unpublish", headers=headers, timeout=10)
    unpub_ok = resp.status_code == 200
    doc.add_step(1, "Mover evento a borrador", "HTTP 200", f"HTTP {resp.status_code}", "✓" if unpub_ok else "✗")

    # Restaurar publicación para mantener consistencia de pruebas
    r_restore = requests.patch(f"{GATEWAY_URL}/api/manager/events/100001/publish", headers=headers, timeout=10)
    res_ok = r_restore.status_code == 200
    doc.add_step(2, "Restaurar publicación", "HTTP 200", f"HTTP {r_restore.status_code}", "✓" if res_ok else "✗")

    success = unpub_ok and res_ok
    doc.attach_evidence("http_response", {"unpublish": resp.status_code, "restore": r_restore.status_code})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
