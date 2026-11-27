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
    doc = TestCaseDocumenter("CP-OPE-046", "staff_redeem_invalid_ticket_post", "API / Operador",
                             level="API", test_type="Funcional / Negativo", technique="Caja negra")
    doc.set_metadata("Validar que la tentativa de canje en POST /api/staff/redeem con ticket inválido sea rechazada.",
                     "Comprobar que no se otorgue acceso a boletos espurios o no registrados",
                     "Servicio laika_tickets activo; token de operador", "Ticket: TKT-NONEXISTENT-9999")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"code": "TKT-NONEXISTENT-9999", "gate": "Puerta Central"}
        r = requests.post(f"{GATEWAY_URL}/api/staff/redeem", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        
        # Debe rechazar y en ningún caso devolver 200 con valid=true
        rejected = (r.status_code != 200) or (not r.json().get("valid", False))
        doc.add_step(1, "Enviar canje de boleto inexistente", "Rechazo seguro (no valid=true)", f"HTTP {r.status_code}", "✓" if rejected else "✗")
        assert rejected, "Ticket inexistente fue indebidamente redimido como válido"
        
        doc.attach_evidence("staff_redeem_rejection", {"status_code": r.status_code, "text": r.text[:200]})
        doc.finish("Aprobada", observations=f"Rechazo seguro validado: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
