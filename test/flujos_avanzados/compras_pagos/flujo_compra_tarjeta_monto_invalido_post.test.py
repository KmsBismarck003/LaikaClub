import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-002", "flujo_compra_tarjeta_monto_invalido_post", "Pagos / Validación",
                             level="API", test_type="Validación / Negativo", technique="Caja negra")
    doc.set_metadata("Validar rechazo de intención de pago con monto inválido o ausente en POST /payments/create-intent",
                     "Garantizar control de integridad financiera ante montos espurios",
                     "Servicio laika_tickets activo; usuario autenticado", "Monto: 'no-numerico'")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"amount": "no-numerico", "eventId": 100001}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/payments/create-intent", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        doc.add_step(1, "Enviar POST create-intent con monto no numérico", "HTTP 400 Bad Request", f"HTTP {r.status_code}", "✓" if r.status_code == 400 else "✗")
        assert r.status_code == 400, f"Expected 400 Bad Request, got {r.status_code}"
        doc.attach_evidence("monto_invalido_response", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Rechazo validado con HTTP 400: {r.text[:80]}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
