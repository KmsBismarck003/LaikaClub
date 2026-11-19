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
    doc = TestCaseDocumenter("CP-ADM-025", "flujo_configuracion_global_plataforma_uat", "UAT / Admin",
                             level="UAT", test_type="Aceptación de Usuario", technique="Caja negra")
    doc.set_metadata("Flujo de aceptación de configuración global de la plataforma",
                     "Consultar configuración runtime, actualizar un parámetro y verificar su persistencia",
                     "Admin autenticado", "/api/config/*")
    doc.start()
    headers = get_admin_auth_headers()

    # 1. Leer config
    r_get = requests.get(f"{GATEWAY_URL}/api/config", headers=headers, timeout=10)
    get_ok = r_get.status_code == 200
    doc.add_step(1, "Leer configuración global actual", "HTTP 200", f"HTTP {r_get.status_code}", "✓" if get_ok else "✗")

    # 2. Actualizar parámetro
    param_key = "qa_test_flag"
    r_post = requests.post(f"{GATEWAY_URL}/api/config/{param_key}", json={"value": "enabled_by_qa"}, headers=headers, timeout=10)
    post_ok = r_post.status_code == 200
    doc.add_step(2, "Actualizar parámetro global de prueba", "HTTP 200", f"HTTP {r_post.status_code}", "✓" if post_ok else "✗")

    # 3. Leer parámetro individual
    r_param = requests.get(f"{GATEWAY_URL}/api/config/{param_key}", headers=headers, timeout=10)
    param_val = r_param.json().get("value") if r_param.status_code == 200 else None
    verified = (param_val == "enabled_by_qa")
    doc.add_step(3, "Verificar persistencia del valor", "value=='enabled_by_qa'", f"value={param_val}", "✓" if verified else "✗")

    doc.attach_evidence("config_update_flow", {"read": get_ok, "updated": post_ok, "verified": verified})
    success = get_ok and post_ok and verified
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
