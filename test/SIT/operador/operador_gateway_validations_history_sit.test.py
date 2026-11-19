import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-012", "operador_gateway_validations_history_sit", "SIT / Operador",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Tickets Service (/api/tickets/validations/history)",
                     "Garantizar recuperación de bitácora histórica de validaciones",
                     "Servicio Tickets activo", "GET /api/tickets/validations/history")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "Consultar historial de validaciones", "HTTP 200 con lista JSON", f"HTTP {resp.status_code}, total={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("validations_history_sit", {"status": resp.status_code, "count": len(resp.json()) if ok else 0})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
