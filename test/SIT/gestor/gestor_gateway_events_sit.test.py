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
    doc = TestCaseDocumenter("CP-GES-010", "gestor_gateway_events_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Events Service (/api/manager/events)",
                     "Garantizar enrutamiento reverso y propagación de JWT de gestor",
                     "Gateway activo en puerto 8000", "GET /api/manager/events")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "Petición a través del Gateway", "HTTP 200 y array JSON", f"HTTP {resp.status_code}, elementos={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("gateway_events", {"status": resp.status_code, "count": len(resp.json()) if ok else 0})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
