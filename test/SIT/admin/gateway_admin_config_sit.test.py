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
    doc = TestCaseDocumenter("CP-ADM-012", "gateway_admin_config_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar integración Gateway -> Admin para /api/config",
                     "Verificar lectura de configuración runtime a través de la pasarela",
                     "Admin autenticado", "GET /api/config")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/config"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/config a través de Gateway", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_params = "sessionTimeout" in data or "registrationEnabled" in data
    doc.add_step(2, "Verificar parámetros de configuración", "Parámetros globales presentes", f"Keys: {list(data.keys())}", "✓" if has_params else "✗")

    doc.attach_evidence("config_response", {"status": resp.status_code, "payload": data})
    success = status_ok and has_params
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
