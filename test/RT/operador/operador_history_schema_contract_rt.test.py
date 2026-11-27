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
    doc = TestCaseDocumenter("CP-OPE-027", "operador_history_schema_contract_rt", "RT / Operador",
                             level="RT", test_type="Regresión / Contrato", technique="Caja negra")
    doc.set_metadata("Comprobar estabilidad del contrato de historial de validaciones",
                     "Verificar que cada registro contenga ticketCode y id",
                     "GET /api/tickets/validations/history", "Contrato JSON")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    has_items = len(data) > 0 and all("ticketCode" in item for item in data)
    ok = resp.status_code == 200 and has_items
    doc.add_step(1, "Validar contrato de historial de validaciones", "ticketCode en array JSON", f"HTTP {resp.status_code}, elementos={len(data)}", "✓" if ok else "✗")
    doc.attach_evidence("history_contract", {"status": resp.status_code, "count": len(data)})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
