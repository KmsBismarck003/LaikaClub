import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-034", "operador_unauthenticated_staff_rejected_sec", "SECURITY / Operador",
                             level="SECURITY", test_type="Seguridad / Auth", technique="Caja negra")
    doc.set_metadata("Validar rechazo total de peticiones sin autenticación en rutas staff",
                     "Garantizar respuesta HTTP 401 Unauthorized sin cabecera Bearer",
                     "Sin cabecera Authorization", "GET /api/stats/staff/dashboard")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", timeout=10)
    rejected = resp.status_code in [401, 403]
    doc.add_step(1, "Petición anónima a /api/stats/staff/dashboard", "HTTP 401 Unauthorized", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("unauth_sec", {"status": resp.status_code})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
