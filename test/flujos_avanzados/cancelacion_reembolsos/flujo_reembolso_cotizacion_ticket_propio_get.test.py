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
    doc = TestCaseDocumenter("CP-ADV-007", "flujo_reembolso_cotizacion_ticket_propio_get", "Reembolsos / Cotización",
                             level="API", test_type="Funcional / Cotización", technique="Caja negra")
    doc.set_metadata("Validar cotización previa de reembolso para boleto propio del usuario autenticado",
                     "Garantizar que el usuario conozca el importe neto antes de confirmar cancelación",
                     "Boleto 200265 perteneciente al usuario de pruebas", "Ticket ID: 200265")
    doc.start()
    try:
        headers = get_auth_headers()
        ticket_id = 200265
        r = requests.get(f"{GATEWAY_URL}/api/tickets/refunds/quote/{ticket_id}", headers=headers, timeout=TIMEOUT_DEFAULT)
        doc.add_step(1, "Cotizar cancelación de boleto propio", "HTTP 200 OK con desglose financiero", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data.get("ticketId") == ticket_id, "Ticket ID discrepante en cotización"
        doc.attach_evidence("quote_response", data)
        doc.finish("Aprobada", observations=f"Cotización obtenida exitosamente para ticket {ticket_id}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
