import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-038", "rechazo_peticion_sin_token_en_admin_security", "SECURITY / Admin",
                             level="SECURITY", test_type="Seguridad / Autenticación", technique="Caja negra")
    doc.set_metadata("Verificar rechazo estricto de peticiones sin token en rutas de administración",
                     "Comprobar que una petición sin header Authorization sea rechazada de inmediato",
                     "Sin token de autorización", "GET /api/admin/users")
    doc.start()
    url = f"{GATEWAY_URL}/api/admin/users"
    resp = requests.get(url, timeout=10)
    rejected = resp.status_code in [401, 403, 500]
    doc.add_step(1, "GET sin token en endpoint administrativo", "HTTP 401/403/Access Denied", f"HTTP {resp.status_code}", "✓" if rejected else "✗")

    doc.attach_evidence("no_token_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
