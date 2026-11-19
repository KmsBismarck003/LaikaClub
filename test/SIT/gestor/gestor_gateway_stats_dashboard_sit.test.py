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
    doc = TestCaseDocumenter("CP-GES-014", "gestor_gateway_stats_dashboard_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Stats Service (/api/stats/manager/dashboard)",
                     "Validar entrega de datos consolidados para gráficas de gestión",
                     "Stats Service activo", "GET /api/stats/manager/dashboard")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "revenue" in data and "tickets" in data
    doc.add_step(1, "Consultar métricas del dashboard gestor", "HTTP 200 con revenue y tickets", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("stats_dashboard", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
