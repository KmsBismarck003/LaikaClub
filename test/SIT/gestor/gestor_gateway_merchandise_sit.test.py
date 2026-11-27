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
    doc = TestCaseDocumenter("CP-GES-015", "gestor_gateway_merchandise_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Merchandise Service (/api/merchandise?manager_id=3)",
                     "Verificar recuperación de catálogo de productos oficiales del gestor",
                     "Merchandise Service activo", "GET /api/merchandise?manager_id=3")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/merchandise?manager_id=3", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "Consultar catálogo de mercancía", "HTTP 200 con lista JSON", f"HTTP {resp.status_code}, total={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("merch_sit", {"status": resp.status_code, "items": resp.json() if ok else []})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
