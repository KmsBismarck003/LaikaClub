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
    doc = TestCaseDocumenter("CP-GES-012", "gestor_gateway_revenue_analytics_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Events + Tickets (/api/manager/events/100001/revenue)",
                     "Verificar cálculo de ingresos brutos y netos en tiempo real",
                     "Evento 100001 existente", "GET /api/manager/events/100001/revenue")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events/100001/revenue", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "gross" in data and "net" in data
    doc.add_step(1, "Consulta de ingresos financieros", "HTTP 200 con 'gross' y 'net'", f"HTTP {resp.status_code}, gross={data.get('gross')}, net={data.get('net')}", "✓" if ok else "✗")
    doc.attach_evidence("revenue_analytics", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
