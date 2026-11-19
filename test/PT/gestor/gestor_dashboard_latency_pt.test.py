import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-035", "gestor_dashboard_latency_pt", "PT / Gestor",
                             level="PT", test_type="Rendimiento / Latencia", technique="Caja negra")
    doc.set_metadata("Medir tiempo de respuesta en dashboard analítico del gestor",
                     "Garantizar latencia < 800ms en /api/stats/manager/dashboard",
                     "Gestor autenticado", "GET /api/stats/manager/dashboard")
    doc.start()
    headers = get_gestor_auth_headers()
    t0 = time.time()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    latency_ms = (time.time() - t0) * 1000
    ok = resp.status_code == 200 and latency_ms < 800.0
    doc.add_step(1, "Medir latencia en dashboard gestor", "< 800ms", f"{latency_ms:.2f}ms", "✓" if ok else "✗")
    doc.attach_evidence("dashboard_latency", {"status": resp.status_code, "latency_ms": latency_ms})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
