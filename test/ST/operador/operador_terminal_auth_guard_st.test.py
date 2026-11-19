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
    doc = TestCaseDocumenter("CP-OPE-015", "operador_terminal_auth_guard_st", "ST / Operador",
                             level="ST", test_type="Funcional / Seguridad", technique="Caja negra")
    doc.set_metadata("Evaluar guardia de autorización en la terminal operativa del operador",
                     "Garantizar acceso autorizado con token de rol operador",
                     "Token con rol operador", "GET /api/stats/staff/dashboard")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=10)
    ok = resp.status_code == 200
    doc.add_step(1, "Acceso a panel de staff", "HTTP 200", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("auth_guard_st", {"status": resp.status_code})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
