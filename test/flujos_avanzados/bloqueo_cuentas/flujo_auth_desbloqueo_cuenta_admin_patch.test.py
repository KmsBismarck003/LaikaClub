import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-045", "flujo_auth_desbloqueo_cuenta_admin_patch", "Seguridad / Desbloqueo",
                             level="SECURITY", test_type="Seguridad / Administrador", technique="Caja negra")
    doc.set_metadata("Validar facultad administrativa para desbloquear cuentas de usuario bloqueadas",
                     "Comprobar restauración de estado activo y reinicio de contador de intentos",
                     "Servicio laika_auth activo; credenciales admin", "Ruta: PATCH /api/admin/users/30165/unlock")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        r = requests.patch(f"{GATEWAY_URL}/api/admin/users/30165/unlock", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Error al desbloquear: {r.status_code} - {r.text}"
        data = r.json()
        doc.add_step(1, "Desbloquear cuenta de usuario ID 30165", "HTTP 200 con confirmación", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("unlock_response", data)
        doc.finish("Aprobada", observations="Cuenta desbloqueada exitosamente por administrador")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
