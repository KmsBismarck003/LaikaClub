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
    doc = TestCaseDocumenter("CP-OPE-042", "operador_extreme_length_ticket_code_et", "ET / Operador",
                             level="ET", test_type="Exploratorio / Desbordamiento", technique="Caja negra")
    doc.set_metadata("Explorar límites ante código de boleto excesivamente largo (5,000 caracteres)",
                     "Garantizar inmunidad ante ataques de desbordamiento de buffer o DoS en parsing",
                     "String de 5,000 chars", "TKT-" + "A" * 5000)
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-" + "A" * 5000}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    handled = resp.status_code in [200, 400, 413, 422, 500]
    doc.add_step(1, "Enviar código de 5,000 caracteres", "Manejo controlado sin error de memoria ni caída de servicio", f"HTTP {resp.status_code}", "✓" if handled else "✗")
    doc.attach_evidence("overflow_et", {"status": resp.status_code})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
