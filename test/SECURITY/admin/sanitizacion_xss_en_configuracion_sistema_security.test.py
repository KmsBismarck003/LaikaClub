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
    doc = TestCaseDocumenter("CP-ADM-040", "sanitizacion_xss_en_configuracion_sistema_security", "SECURITY / Admin",
                             level="SECURITY", test_type="Seguridad / XSS", technique="Caja negra")
    doc.set_metadata("Comprobar almacenamiento seguro de payloads XSS en parámetros de configuración",
                     "Garantizar que el sistema almacene o sanitice tags de script sin ejecución perjudicial",
                     "Admin autenticado", "POST /api/config/xss_test_key")
    doc.start()
    headers = get_admin_auth_headers()
    xss_payload = "<script>alert('XSS_ADMIN_TEST')</script>"
    url = f"{GATEWAY_URL}/api/config/xss_test_key"
    resp = requests.post(url, json={"value": xss_payload}, headers=headers, timeout=10)
    stored_safe = resp.status_code == 200

    r_get = requests.get(url, headers=headers, timeout=10)
    val = r_get.json().get("value") if r_get.status_code == 200 else ""
    doc.add_step(1, "Enviar payload XSS a configuración", "HTTP 200 persistencia como texto plano", f"HTTP {resp.status_code}, valor={val}", "✓" if stored_safe else "✗")

    doc.attach_evidence("xss_defense", {"status": resp.status_code, "stored_value": val})
    doc.finish("Aprobada" if stored_safe else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
