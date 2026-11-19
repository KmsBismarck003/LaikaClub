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
    doc = TestCaseDocumenter("CP-GES-030", "gestor_events_schema_contract_rt", "RT / Gestor",
                             level="RT", test_type="Regresión / Contrato", technique="Caja negra")
    doc.set_metadata("Comprobar estabilidad e invarianza del contrato de eventos",
                     "Verificar presencia de campos id, name, price, status en /api/manager/events",
                     "Petición autenticada de gestor", "GET /api/manager/events")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    required_keys = {"id", "name", "price", "status", "category", "total_tickets"}
    all_match = len(data) > 0 and all(required_keys.issubset(ev.keys()) for ev in data)
    ok = resp.status_code == 200 and all_match
    doc.add_step(1, "Validar contrato de eventos", "Todos los campos presentes", f"HTTP {resp.status_code}, match={all_match}", "✓" if ok else "✗")
    doc.attach_evidence("events_contract", {"status": resp.status_code, "contract_valid": all_match})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
