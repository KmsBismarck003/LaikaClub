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
    doc = TestCaseDocumenter("CP-OPE-041", "operador_malformed_qr_payload_et", "ET / Operador",
                             level="ET", test_type="Exploratorio / Resiliencia", technique="Caja negra")
    doc.set_metadata("Explorar comportamiento ante lectura óptica con caracteres malformados",
                     "Garantizar que secuencias de control o caracteres no imprimibles no provoquen crash",
                     "Payload corrupto", "TKT-!@#$%^&*()_+{}[]:;<>,.?/")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-!@#$%^&*()_+{}[]:;<>,.?/"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    handled = resp.status_code in [200, 400]
    doc.add_step(1, "Enviar código con caracteres corruptos", "Manejo controlado (HTTP 200 con INVALID_CODE o 400)", f"HTTP {resp.status_code}", "✓" if handled else "✗")
    doc.attach_evidence("malformed_et", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
