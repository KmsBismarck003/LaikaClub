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
    doc = TestCaseDocumenter("CP-OPE-011", "operador_gateway_staff_verify_sit", "SIT / Operador",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar enrutamiento Gateway -> Tickets Service (/api/staff/verify)",
                     "Verificar ruta oficial de terminal staff para escaneo en puerta",
                     "Terminal de acceso staff", "POST /api/staff/verify")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-C853F390"}
    resp = requests.post(f"{GATEWAY_URL}/api/staff/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "statusCode" in data
    doc.add_step(1, "Petición /api/staff/verify", "HTTP 200 con respuesta estructurada", f"HTTP {resp.status_code}, status={data.get('statusCode')}", "✓" if ok else "✗")
    doc.attach_evidence("staff_verify_sit", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
