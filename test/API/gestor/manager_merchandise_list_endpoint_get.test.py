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
    doc = TestCaseDocumenter("CP-GES-072", "manager_merchandise_list_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Mercancía", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/merchandise con filtro manager_id=3",
                     "Validar que el gestor consulte exclusivamente sus productos de mercancía",
                     "Gestor ID 3", "GET /api/merchandise?manager_id=3")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/merchandise?manager_id=3", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    all_belong = len(data) > 0 and all(item.get("managerId") == 3 for item in data)
    ok = resp.status_code == 200 and all_belong
    doc.add_step(1, "GET /api/merchandise?manager_id=3", "HTTP 200 con productos de manager 3", f"HTTP {resp.status_code}, total={len(data)}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(data)})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
