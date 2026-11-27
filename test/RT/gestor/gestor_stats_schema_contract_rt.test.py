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
    doc = TestCaseDocumenter("CP-GES-031", "gestor_stats_schema_contract_rt", "RT / Gestor",
                             level="RT", test_type="Regresión / Contrato", technique="Caja negra")
    doc.set_metadata("Comprobar estabilidad del contrato de métricas del gestor",
                     "Verificar que /api/stats/manager/dashboard contenga revenue, tickets y categories",
                     "Petición de analítica", "GET /api/stats/manager/dashboard")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    req_keys = {"revenue", "tickets", "categories", "labels"}
    has_all = req_keys.issubset(data.keys())
    ok = resp.status_code == 200 and has_all
    doc.add_step(1, "Validar contrato de estadísticas", "Campos requeridos presentes", f"HTTP {resp.status_code}, match={has_all}", "✓" if ok else "✗")
    doc.attach_evidence("stats_contract", {"status": resp.status_code, "keys": list(data.keys())})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
