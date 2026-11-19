import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-021", "flujo_login_admin_y_verificacion_permisos_uat", "UAT / Admin",
                             level="UAT", test_type="Aceptación de Usuario", technique="Caja negra")
    doc.set_metadata("Flujo de aceptación de inicio de sesión del Administrador",
                     "Validar ingreso oficial a la plataforma y recepción del perfil con rol admin",
                     "Credenciales maestras de administración", "admin@laikaclub.com / gearsof2")
    doc.start()
    url = f"{GATEWAY_URL}/api/auth/login"
    resp = requests.post(url, json={"email": QA_ADMIN_EMAIL, "password": QA_ADMIN_PASSWORD}, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Iniciar sesión como Administrador", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    token = data.get("token")
    user = data.get("user", {})
    has_token = bool(token)
    is_admin_role = user.get("role") == "admin"
    doc.add_step(2, "Verificar emisión de token y rol admin", "Token presente y role=='admin'", f"role={user.get('role')}", "✓" if (has_token and is_admin_role) else "✗")

    doc.attach_evidence("admin_login_profile", {"status": resp.status_code, "email": user.get("email"), "role": user.get("role")})
    success = status_ok and has_token and is_admin_role
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
