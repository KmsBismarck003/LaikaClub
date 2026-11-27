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
    doc = TestCaseDocumenter("CP-OPE-028", "operador_staff_stats_contract_rt", "RT / Operador",
                             level="RT", test_type="Regresión / Contrato", technique="Caja negra")
    doc.set_metadata("Comprobar estabilidad del contrato de estadísticas de staff",
                     "Verificar que /api/stats/staff/dashboard contenga scansPerHour y labels",
                     "Endpoint analítico de staff", "GET /api/stats/staff/dashboard")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    req_keys = {"scansPerHour", "labels", "totalScanned"}
    has_keys = req_keys.issubset(data.keys())
    ok = resp.status_code == 200 and has_keys
    doc.add_step(1, "Validar contrato de métricas de staff", "Campos mínimos presentes", f"HTTP {resp.status_code}, match={has_keys}", "✓" if ok else "✗")
    doc.attach_evidence("staff_contract", {"status": resp.status_code, "keys": list(data.keys())})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
