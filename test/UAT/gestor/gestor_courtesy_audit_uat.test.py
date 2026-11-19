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
    doc = TestCaseDocumenter("CP-GES-023", "gestor_courtesy_audit_uat", "UAT / Gestor",
                             level="UAT", test_type="Aceptación / Cortesías", technique="Caja negra")
    doc.set_metadata("Comprobar panel de auditoría de cortesías para evento",
                     "Garantizar disponibilidad de cuotas restantes y boletos emitidos",
                     "Evento 100001", "GET /api/tickets/courtesy/event/100001")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/event/100001", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "totalQuotaAllowed" in data and "totalQuotaRemaining" in data
    doc.add_step(1, "Inspección de panel de cortesías", "HTTP 200 con cuotas", f"HTTP {resp.status_code}, allowed={data.get('totalQuotaAllowed')}", "✓" if ok else "✗")
    doc.attach_evidence("courtesy_audit_uat", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
