import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-014", "gateway_admin_stats_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar integración Gateway -> Stats Microservice para métricas de admin",
                     "Verificar acceso a métricas ejecutivas de ventas y usuarios",
                     "Admin autenticado", "GET /api/stats/admin/dashboard")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/stats/admin/dashboard"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/stats/admin/dashboard", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_metrics = "totalUsers" in data and "totalSales" in data
    doc.add_step(2, "Verificar métricas consolidadas", "totalUsers y totalSales presentes", f"Users: {data.get('totalUsers')}", "✓" if has_metrics else "✗")

    doc.attach_evidence("stats_dashboard", {"status": resp.status_code, "metrics": data})
    success = status_ok and has_metrics
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
