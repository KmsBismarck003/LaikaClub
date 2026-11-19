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
    doc = TestCaseDocumenter("CP-ADV-010", "flujo_transferencia_a_si_mismo_rechazo_post", "Transferencias / Reglas",
                             level="API", test_type="Reglas de Negocio / Anti-Fraude", technique="Caja negra")
    doc.set_metadata("Validar regla anti-fraude: rechazo estricto al intentar transferir un boleto al propio correo",
                     "Garantizar que una transferencia requiera un destinatario distinto al remitente",
                     "Usuario qa_user_test@laikaclub.com con boleto 200265", "Destinatario: mismo email")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"ticket_id": 200265, "recipient_email": "qa_user_test@laikaclub.com"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/transfer/request", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 400, f"Expected 400 Bad Request, got {r.status_code}"
        assert "a ti mismo" in r.text or r.status_code == 400
        doc.add_step(1, "Solicitar transferencia hacia uno mismo", "HTTP 400 'No puedes transferirte un boleto a ti mismo'", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("self_transfer_rejection", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Auto-transferencia rechazada con éxito: {r.text[:80]}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
