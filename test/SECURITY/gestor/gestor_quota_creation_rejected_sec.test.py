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
    doc = TestCaseDocumenter("CP-GES-038", "gestor_quota_creation_rejected_sec", "SECURITY / Gestor",
                             level="SECURITY", test_type="Seguridad / RBAC", technique="Caja negra")
    doc.set_metadata("Validar que gestor no pueda auto-asignarse cuotas de cortesía",
                     "Garantizar HTTP 403 en POST /api/tickets/courtesy/quota (solo admin)",
                     "Token con rol gestor", "POST /api/tickets/courtesy/quota")
    doc.start()
    headers = get_gestor_auth_headers()
    payload = {"managerUserId": 3, "eventId": 100001, "maxAllowed": 100}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/courtesy/quota", headers=headers, json=payload, timeout=10)
    rejected = resp.status_code == 403
    doc.add_step(1, "Intento de asignación de cuota", "HTTP 403 Forbidden", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("quota_sec", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
