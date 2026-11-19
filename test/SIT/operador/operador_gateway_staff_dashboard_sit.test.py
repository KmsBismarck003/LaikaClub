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
    doc = TestCaseDocumenter("CP-OPE-013", "operador_gateway_staff_dashboard_sit", "SIT / Operador",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Stats Service (/api/stats/staff/dashboard)",
                     "Verificar KPIs de afluencia por hora para el personal de acceso",
                     "Servicio Stats activo", "GET /api/stats/staff/dashboard")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "scansPerHour" in data and "labels" in data
    doc.add_step(1, "Consultar métricas de staff", "HTTP 200 con scansPerHour y labels", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("staff_dashboard_sit", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
