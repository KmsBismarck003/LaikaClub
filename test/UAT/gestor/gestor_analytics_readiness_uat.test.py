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
    doc = TestCaseDocumenter("CP-GES-025", "gestor_analytics_readiness_uat", "UAT / Gestor",
                             level="UAT", test_type="Aceptación / Analítica", technique="Caja negra")
    doc.set_metadata("Comprobar preparación de métricas para dashboard del gestor",
                     "Garantizar que existan series temporales para Recharts/Plotly",
                     "Endpoint analítico", "GET /api/stats/manager/dashboard")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_labels = "labels" in data and len(data.get("labels", [])) > 0
    has_revenue = "revenue" in data and len(data.get("revenue", [])) > 0
    ok = resp.status_code == 200 and has_labels and has_revenue
    doc.add_step(1, "Inspección de datos analíticos", "HTTP 200 con labels y series de ingresos", f"HTTP {resp.status_code}, labels={len(data.get('labels', []))}", "✓" if ok else "✗")
    doc.attach_evidence("analytics_uat", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
