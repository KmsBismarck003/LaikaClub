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
    doc = TestCaseDocumenter("CP-GES-061", "manager_stats_dashboard_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Analítica", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/stats/manager/dashboard",
                     "Validar KPIs ejecutivos para panel de control del gestor",
                     "Gestor autenticado", "GET /api/stats/manager/dashboard")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "revenue" in data and "tickets" in data
    doc.add_step(1, "GET /api/stats/manager/dashboard", "HTTP 200 con datos analíticos", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
