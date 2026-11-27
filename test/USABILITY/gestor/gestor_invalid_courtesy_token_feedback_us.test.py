import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-043", "gestor_invalid_courtesy_token_feedback_us", "USABILITY / Gestor",
                             level="USABILITY", test_type="Usabilidad / Mensajería", technique="Caja negra")
    doc.set_metadata("Evaluar claridad del mensaje ante token de cortesía inexistente",
                     "Garantizar respuesta explicativa HTTP 404 al intentar validar token inválido",
                     "Token ficticio", "GET /api/tickets/courtesy/validate-token/CODIGO-INEXISTENTE-999")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/validate-token/CODIGO-INEXISTENTE-999", timeout=10)
    data = resp.json() if resp.status_code == 404 else {}
    has_message = "message" in data or "error" in data
    ok = resp.status_code == 404 and has_message
    doc.add_step(1, "Validar feedback por token inexistente", "HTTP 404 con mensaje claro", f"HTTP {resp.status_code}, msg='{data.get('message')}'", "✓" if ok else "✗")
    doc.attach_evidence("token_feedback", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
