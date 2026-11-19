import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-059", "admin_test_email_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / SMTP", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/auth/admin/test-email",
                     "Verificar prueba de conectividad y envío de correo de diagnóstico",
                     "Admin autenticado", "POST /api/auth/admin/test-email")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/auth/admin/test-email"
    payload = {"email": "qa_smtp_test@laikaclub.com"}
    resp = requests.post(url, json=payload, headers=headers, timeout=20)
    status_ok = resp.status_code == 200
    doc.add_step(1, "POST /api/auth/admin/test-email", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_status = "status" in data
    doc.add_step(2, "Verificar resultado de prueba SMTP", "Campo status presente", f"status={data.get('status')}", "✓" if has_status else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    success = status_ok and has_status
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
