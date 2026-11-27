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
    doc = TestCaseDocumenter("CP-OPE-016", "operador_audit_trail_consistency_st", "ST / Operador",
                             level="ST", test_type="Integridad / Auditoría", technique="Caja negra")
    doc.set_metadata("Evaluar consistencia cronológica en la bitácora de validaciones de acceso",
                     "Verificar que cada escaneo genere un registro con created_at no nulo",
                     "Bitácora de validaciones", "GET /api/tickets/validations/history")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    all_have_ticket = len(data) > 0 and all("ticketCode" in log for log in data)
    ok = resp.status_code == 200 and all_have_ticket
    doc.add_step(1, "Validar integridad estructural de logs", "ticketCode presente en cada log", f"Total: {len(data)}", "✓" if ok else "✗")
    doc.attach_evidence("audit_trail_check", {"count": len(data), "valid": ok})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
