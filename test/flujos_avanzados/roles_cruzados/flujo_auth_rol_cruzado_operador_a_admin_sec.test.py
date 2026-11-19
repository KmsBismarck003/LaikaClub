import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-023", "flujo_auth_rol_cruzado_operador_a_admin_sec", "Seguridad / Roles",
                             level="SECURITY", test_type="Seguridad / RBAC", technique="Caja negra")
    doc.set_metadata("Validar rechazo de autenticación cruzada: operador intentando modificar configuración admin",
                     "Garantizar que terminales de operador no puedan alterar parámetros de configuración administrativa",
                     "Token de rol operador", "Ruta: PUT /api/config")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        r = requests.put(f"{GATEWAY_URL}/api/config", json={"sessionTimeout": 99}, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [401, 403], f"Acceso concedido indebidamente con HTTP {r.status_code}"
        doc.add_step(1, "Modificar /api/config con rol operador", "HTTP 401/403 Denegado", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("operador_on_admin_rejection", {"status_code": r.status_code})
        doc.finish("Aprobada", observations=f"Acceso denegado correctamente: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
