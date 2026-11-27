import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-057", "tickets_free_courtesy_purchase_endpoint_post", "API / Operador",
                             level="API", test_type="Seguridad / Cuotas", technique="Caja negra")
    doc.set_metadata("Validar que POST /api/tickets/free rechace con 403 Forbidden la emisión de cortesías sin cupo.",
                     "Comprobar blindaje contra emisión no autorizada de cortesías desde terminales",
                     "Servicio laika_tickets activo; token de operador", "EventId: 100001")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"eventId": 100001, "seatCode": "GEN-01"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/free", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Intentar emisión de cortesía no habilitada", "HTTP 403 Forbidden", f"HTTP {r.status_code}", "✓" if r.status_code == 403 else "✗")
        assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}"
        
        data = r.json()
        doc.attach_evidence("free_courtesy_rejection", data)
        doc.finish("Aprobada", observations=f"403 Forbidden verificado: {data.get('message', '')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
