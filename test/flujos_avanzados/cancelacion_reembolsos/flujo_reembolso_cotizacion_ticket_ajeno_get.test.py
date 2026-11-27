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
    doc = TestCaseDocumenter("CP-ADV-008", "flujo_reembolso_cotizacion_ticket_ajeno_get", "Reembolsos / Seguridad",
                             level="API", test_type="Seguridad / Control de Acceso", technique="Caja negra")
    doc.set_metadata("Validar blindaje de seguridad: rechazo al intentar cotizar reembolso de un boleto ajeno",
                     "Impedir que un usuario consulte o cancele boletos de terceros (OWASP A01 IDOR)",
                     "Boleto 200181 pertenece a otro usuario", "Ticket ID: 200181")
    doc.start()
    try:
        headers = get_auth_headers()
        alien_ticket_id = 200181
        r = requests.get(f"{GATEWAY_URL}/api/tickets/refunds/quote/{alien_ticket_id}", headers=headers, timeout=TIMEOUT_DEFAULT)
        # Debe responder 404 o 403 por pertenecer a otro usuario
        assert r.status_code in [403, 404], f"Boleto ajeno admitió cotización con status {r.status_code}"
        doc.add_step(1, "Cotizar boleto ajeno", "HTTP 404 o 403 de denegación", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("alien_quote_rejection", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Intento de cotización sobre boleto ajeno bloqueado: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
