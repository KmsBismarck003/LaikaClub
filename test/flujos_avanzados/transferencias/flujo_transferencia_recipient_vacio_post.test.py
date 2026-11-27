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
    doc = TestCaseDocumenter("CP-ADV-011", "flujo_transferencia_recipient_vacio_post", "Transferencias / Validación",
                             level="API", test_type="Validación / REST", technique="Caja negra")
    doc.set_metadata("Validar validación de entrada: rechazo al enviar solicitud de transferencia sin recipient_email",
                     "Garantizar que el campo recipient_email sea obligatorio",
                     "Servicio laika_tickets activo; usuario autenticado", "recipient_email: ''")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"ticket_id": 200265, "recipient_email": "   "}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/transfer/request", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 400, f"Expected 400 Bad Request, got {r.status_code}"
        doc.add_step(1, "Enviar transferencia sin correo", "HTTP 400 Bad Request", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("transfer_recipient_err", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Rechazo validado: {r.text[:80]}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
