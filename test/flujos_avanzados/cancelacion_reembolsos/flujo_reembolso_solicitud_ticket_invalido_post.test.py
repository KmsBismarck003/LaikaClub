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
    doc = TestCaseDocumenter("CP-ADV-009", "flujo_reembolso_solicitud_ticket_invalido_post", "Reembolsos / Validación",
                             level="API", test_type="Validación / Negativo", technique="Caja negra")
    doc.set_metadata("Validar validación de parámetros: rechazo en POST /refunds/request ante ticketId nulo",
                     "Garantizar consistencia en la formalización de solicitudes de reembolso",
                     "Servicio laika_tickets activo; usuario autenticado", "Payload: {'reason': 'test'}")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"reason": "Motivo sin ticketId"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/refunds/request", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 400, f"Expected 400 Bad Request, got {r.status_code}"
        doc.add_step(1, "Enviar solicitud de reembolso incompleta", "HTTP 400 Bad Request", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("refund_validation_err", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Validación estricta confirmada: {r.text[:80]}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
