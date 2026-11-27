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
    doc = TestCaseDocumenter("CP-GES-011", "gestor_gateway_tickets_analytics_sit", "SIT / Gestor",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Events + Tickets (/api/manager/events/100001/tickets)",
                     "Verificar agregación de ventas de boletos en vivo",
                     "Evento 100001 publicado", "GET /api/manager/events/100001/tickets")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events/100001/tickets", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "sold" in data
    doc.add_step(1, "Consulta de boletos vendidos", "HTTP 200 con clave 'sold'", f"HTTP {resp.status_code}, sold={data.get('sold')}", "✓" if ok else "✗")
    doc.attach_evidence("tickets_analytics", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
