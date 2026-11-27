import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-048", "login_admin_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / Autenticación", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/auth/login para credenciales de Administrador",
                     "Validar respuesta HTTP 200 y emisión de token JWT con rol admin",
                     "Credenciales maestras de prueba", "POST /api/auth/login")
    doc.start()
    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_ADMIN_EMAIL, "password": QA_ADMIN_PASSWORD}
    resp = requests.post(url, json=payload, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "POST /api/auth/login", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_token = "token" in data and len(data["token"]) > 20
    is_admin = data.get("user", {}).get("role") == "admin"
    doc.add_step(2, "Verificar rol y token", "token y role=='admin'", f"role={data.get('user', {}).get('role')}", "✓" if (has_token and is_admin) else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "user": data.get("user")})
    success = status_ok and has_token and is_admin
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
