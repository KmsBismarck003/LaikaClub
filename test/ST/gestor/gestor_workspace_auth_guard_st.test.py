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
    doc = TestCaseDocumenter("CP-GES-016", "gestor_workspace_auth_guard_st", "ST / Gestor",
                             level="ST", test_type="Funcional / Seguridad", technique="Caja negra")
    doc.set_metadata("Evaluar guardia de autorización para rutas del gestor",
                     "Garantizar acceso autorizado con token de gestor",
                     "Token con rol gestor", "GET /api/manager/events")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    ok = resp.status_code == 200
    doc.add_step(1, "Acceso a workspace de gestor", "HTTP 200", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("auth_guard", {"status": resp.status_code})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
