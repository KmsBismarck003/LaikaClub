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
    doc = TestCaseDocumenter("CP-OPE-039", "operador_future_event_feedback_us", "USABILITY / Operador",
                             level="USABILITY", test_type="Usabilidad / Mensajería", technique="Caja negra")
    doc.set_metadata("Evaluar claridad del mensaje cuando un boleto corresponde a un evento futuro",
                     "Garantizar explicación comprensible para el operador y el asistente",
                     "Boleto TKT-C853F390", "POST /api/tickets/verify")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-C853F390"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_msg = len(data.get("operatorMessage", "")) > 10
    ok = resp.status_code == 200 and data.get("statusCode") == "FUTURE_EVENT" and has_msg
    doc.add_step(1, "Validar feedback por evento próximo", "FUTURE_EVENT con mensaje explicativo", f"msg='{data.get('operatorMessage')[:60]}...'", "✓" if ok else "✗")
    doc.attach_evidence("future_event_feedback", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
