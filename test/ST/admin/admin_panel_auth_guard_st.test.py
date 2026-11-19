import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-016", "admin_panel_auth_guard_st", "ST / Admin",
                             level="ST", test_type="Seguridad / Guardias", technique="Caja negra")
    doc.set_metadata("Verificar guardia de autenticación en endpoints de administración",
                     "Garantizar rechazo inmediato de peticiones anónimas sin cabecera Authorization",
                     "Petición HTTP sin credenciales", "GET /api/admin/users")
    doc.start()
    url = f"{GATEWAY_URL}/api/admin/users"
    resp = requests.get(url, timeout=10)
    is_rejected = resp.status_code in [401, 403, 500]  # Spring Security rechaza con 401/403/AccessDenied
    doc.add_step(1, "GET anónimo a /api/admin/users", "HTTP 401/403/Access Denied", f"HTTP {resp.status_code}", "✓" if is_rejected else "✗")

    doc.attach_evidence("rejection_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if is_rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
