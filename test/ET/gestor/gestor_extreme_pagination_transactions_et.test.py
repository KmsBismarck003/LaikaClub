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
    doc = TestCaseDocumenter("CP-GES-046", "gestor_extreme_pagination_transactions_et", "ET / Gestor",
                             level="ET", test_type="Exploratorio / Paginación", technique="Caja negra")
    doc.set_metadata("Explorar límites de paginación extrema en transacciones de gestor",
                     "Evaluar comportamiento con limit=0 y limit=1000000",
                     "Valores extremos de parámetro limit", "limit=0, limit=1000000")
    doc.start()
    headers = get_gestor_auth_headers()
    r0 = requests.get(f"{GATEWAY_URL}/api/manager/transactions?limit=0", headers=headers, timeout=10)
    r1m = requests.get(f"{GATEWAY_URL}/api/manager/transactions?limit=1000000", headers=headers, timeout=10)
    ok0 = r0.status_code in [200, 400]
    ok1m = r1m.status_code in [200, 400]
    doc.add_step(1, "Probar limit=0", "Manejo controlado", f"HTTP {r0.status_code}", "✓" if ok0 else "✗")
    doc.add_step(2, "Probar limit=1000000", "Manejo controlado", f"HTTP {r1m.status_code}", "✓" if ok1m else "✗")
    doc.attach_evidence("pagination_et", {"limit0": r0.status_code, "limit1m": r1m.status_code})
    doc.finish("Aprobada" if (ok0 and ok1m) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
