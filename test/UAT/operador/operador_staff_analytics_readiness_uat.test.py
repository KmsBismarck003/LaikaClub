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
    doc = TestCaseDocumenter("CP-OPE-022", "operador_staff_analytics_readiness_uat", "UAT / Operador",
                             level="UAT", test_type="Aceptación / Analítica", technique="Caja negra")
    doc.set_metadata("Comprobar disponibilidad de gráficas de flujo de acceso para la terminal",
                     "Garantizar entrega de scansPerHour y etiquetas para Recharts/Plotly",
                     "Dashboard de staff", "GET /api/stats/staff/dashboard")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_scans = "scansPerHour" in data and len(data.get("scansPerHour", [])) > 0
    ok = resp.status_code == 200 and has_scans
    doc.add_step(1, "Inspección de datos analíticos de torniquete", "HTTP 200 con serie scansPerHour", f"HTTP {resp.status_code}, puntos={len(data.get('scansPerHour', []))}", "✓" if ok else "✗")
    doc.attach_evidence("staff_analytics_uat", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
