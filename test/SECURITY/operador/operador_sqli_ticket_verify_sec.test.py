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
    doc = TestCaseDocumenter("CP-OPE-036", "operador_sqli_ticket_verify_sec", "SECURITY / Operador",
                             level="SECURITY", test_type="Seguridad / Inyección SQL", technique="Caja negra")
    doc.set_metadata("Comprobar inmunidad contra inyección SQL en parámetro ticketCode",
                     "Garantizar que payloads SQL no provoquen errores 500 ni bypass de acceso",
                     "Payload SQLi", "TKT-' OR '1'='1' --")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-' OR '1'='1' --"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    safe = resp.status_code == 200 and data.get("valid") is False
    doc.add_step(1, "Enviar payload SQLi en verify", "valid=False sin error 500", f"HTTP {resp.status_code}, valid={data.get('valid')}", "✓" if safe else "✗")
    doc.attach_evidence("sqli_check", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if safe else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
