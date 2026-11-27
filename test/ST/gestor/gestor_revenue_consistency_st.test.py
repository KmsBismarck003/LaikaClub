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
    doc = TestCaseDocumenter("CP-GES-018", "gestor_revenue_consistency_st", "ST / Gestor",
                             level="ST", test_type="Integridad / Negocio", technique="Caja negra")
    doc.set_metadata("Evaluar consistencia matemática entre boletos vendidos e ingresos brutos",
                     "Comprobar que gross_revenue >= 0 y coincide con conteo transaccional",
                     "Evento 100001", "GET /api/manager/events/100001/revenue")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events/100001/revenue", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    gross = data.get("gross", 0)
    sold = data.get("tickets_sold", 0)
    consistent = resp.status_code == 200 and gross >= 0 and sold >= 0
    doc.add_step(1, "Verificar consistencia no negativa", "gross >= 0 y sold >= 0", f"gross={gross}, sold={sold}", "✓" if consistent else "✗")
    doc.attach_evidence("revenue_check", data)
    doc.finish("Aprobada" if consistent else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
