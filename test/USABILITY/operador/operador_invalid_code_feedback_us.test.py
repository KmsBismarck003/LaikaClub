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
    doc = TestCaseDocumenter("CP-OPE-040", "operador_invalid_code_feedback_us", "USABILITY / Operador",
                             level="USABILITY", test_type="Usabilidad / Mensajería", technique="Caja negra")
    doc.set_metadata("Evaluar claridad del mensaje cuando el código no existe en el sistema",
                     "Garantizar que se notifique 'CÓDIGO INEXISTENTE' al operador",
                     "Código TKT-UNKNOWN-XYZ", "POST /api/tickets/verify")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-UNKNOWN-XYZ"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_title = "INEXISTENTE" in data.get("statusTitle", "").upper()
    ok = resp.status_code == 200 and data.get("statusCode") == "INVALID_CODE" and has_title
    doc.add_step(1, "Validar feedback por código inexistente", "INVALID_CODE con título claro", f"title='{data.get('statusTitle')}'", "✓" if ok else "✗")
    doc.attach_evidence("invalid_code_feedback", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
