import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-064", "manager_courtesy_validate_token_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Cortesías", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/tickets/courtesy/validate-token/{token}",
                     "Validar previsualización de código de cortesía previo a su canje",
                     "Token inexistente", "GET /api/tickets/courtesy/validate-token/TEST-CODE-INVALID")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/validate-token/TEST-CODE-INVALID", timeout=10)
    handled = resp.status_code in [200, 404]
    doc.add_step(1, "Previsualizar token de cortesía", "Manejo HTTP 200 o 404", f"HTTP {resp.status_code}", "✓" if handled else "✗")
    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
