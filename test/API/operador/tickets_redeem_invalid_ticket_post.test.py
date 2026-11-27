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
    doc = TestCaseDocumenter("CP-OPE-047", "tickets_redeem_invalid_ticket_post", "API / Operador",
                             level="API", test_type="Funcional / Negativo", technique="Caja negra")
    doc.set_metadata("Validar que la ruta canónica POST /api/tickets/redeem mantenga rechazo ante códigos espurios.",
                     "Comprobar integridad transaccional de canje en microservicio laika_tickets",
                     "Servicio laika_tickets activo", "Ticket: TKT-FAKE-CODE-000")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"code": "TKT-FAKE-CODE-000", "gate": "Puerta VIP"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/redeem", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        
        rejected = (r.status_code != 200) or (not r.json().get("valid", False))
        doc.add_step(1, "Enviar POST /api/tickets/redeem espurio", "Rechazo transaccional", f"HTTP {r.status_code}", "✓" if rejected else "✗")
        assert rejected, "Canje ficticio aprobado indebidamente"
        
        doc.attach_evidence("tickets_redeem_rejection", {"status_code": r.status_code, "text": r.text[:200]})
        doc.finish("Aprobada", observations=f"Rechazo transaccional validado: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
