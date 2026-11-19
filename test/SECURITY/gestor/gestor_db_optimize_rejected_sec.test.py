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
    doc = TestCaseDocumenter("CP-GES-037", "gestor_db_optimize_rejected_sec", "SECURITY / Gestor",
                             level="SECURITY", test_type="Seguridad / RBAC", technique="Caja negra")
    doc.set_metadata("Validar que gestor no pueda ejecutar optimización de base de datos",
                     "Garantizar HTTP 403 Forbidden en POST /api/database/optimize",
                     "Token con rol gestor", "POST /api/database/optimize")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.post(f"{GATEWAY_URL}/api/database/optimize", headers=headers, timeout=10)
    rejected = resp.status_code in [401, 403]
    doc.add_step(1, "Ejecución de optimización de BD", "HTTP 403 Forbidden", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("optimize_sec", {"status": resp.status_code})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
