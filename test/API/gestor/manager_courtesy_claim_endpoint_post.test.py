import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-065", "manager_courtesy_claim_endpoint_post", "API / Gestor",
                             level="API", test_type="Funcional / Cortesías", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/tickets/courtesy/claim",
                     "Validar manejo de canje de cortesía con token inválido",
                     "Token inválido", "POST /api/tickets/courtesy/claim")
    doc.start()
    headers = get_gestor_auth_headers()
    payload = {"claimToken": "TOKEN-INVALIDO-QA-123"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/courtesy/claim", headers=headers, json=payload, timeout=10)
    handled = resp.status_code in [400, 404]
    doc.add_step(1, "Canjear token inválido", "Rechazo controlado (HTTP 400 o 404)", f"HTTP {resp.status_code}", "✓" if handled else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
