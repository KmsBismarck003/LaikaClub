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
    doc = TestCaseDocumenter("CP-OPE-010", "operador_gateway_tickets_verify_sit", "SIT / Operador",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar comunicación Gateway -> Tickets Service (/api/tickets/verify)",
                     "Garantizar enrutamiento y validación óptica de boleto en vivo",
                     "Gateway activo en puerto 8000", "POST /api/tickets/verify")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-C853F390"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "statusCode" in data
    doc.add_step(1, "Petición verify a través del Gateway", "HTTP 200 con statusCode", f"HTTP {resp.status_code}, status={data.get('statusCode')}", "✓" if ok else "✗")
    doc.attach_evidence("gateway_verify", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
