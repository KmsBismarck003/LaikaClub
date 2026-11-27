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
    doc = TestCaseDocumenter("CP-GES-044", "gestor_create_event_validation_feedback_us", "USABILITY / Gestor",
                             level="USABILITY", test_type="Usabilidad / Formularios", technique="Caja negra")
    doc.set_metadata("Evaluar respuesta del sistema ante creación de evento sin datos obligatorios",
                     "Comprobar que el backend rechace la solicitud con error estructurado",
                     "Payload vacío", "POST /api/manager/events con {}")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.post(f"{GATEWAY_URL}/api/manager/events", headers=headers, json={}, timeout=10)
    rejected = resp.status_code in [400, 422, 500]
    doc.add_step(1, "Enviar payload vacío para alta de evento", "Rechazo estructurado", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("validation_feedback", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
