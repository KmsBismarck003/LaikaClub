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
    doc = TestCaseDocumenter("CP-GES-036", "gestor_admin_routes_rejected_sec", "SECURITY / Gestor",
                             level="SECURITY", test_type="Seguridad / RBAC", technique="Caja negra")
    doc.set_metadata("Validar que gestor no tenga acceso a tablas administrativas",
                     "Garantizar respuesta HTTP 403 Forbidden en /api/database/tables",
                     "Token con rol gestor", "GET /api/database/tables")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/database/tables", headers=headers, timeout=10)
    rejected = resp.status_code in [401, 403]
    doc.add_step(1, "Acceso a tablas administrativas", "HTTP 403 Forbidden", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("admin_tables_sec", {"status": resp.status_code})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
