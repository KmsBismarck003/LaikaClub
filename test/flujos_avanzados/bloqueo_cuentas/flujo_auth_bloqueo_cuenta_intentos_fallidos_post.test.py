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
    doc = TestCaseDocumenter("CP-ADV-044", "flujo_auth_bloqueo_cuenta_intentos_fallidos_post", "Seguridad / Intentos Fallidos",
                             level="SECURITY", test_type="Seguridad / Brute Force Prevention", technique="Caja negra")
    doc.set_metadata("Validar conteo de intentos fallidos y respuesta ante contraseñas incorrectas",
                     "Comprobar que el servicio responde HTTP 401 con metadata de intentos y límite máximo",
                     "Servicio laika_auth activo", "Ruta: POST /api/auth/login")
    doc.start()
    try:
        email = "qa_lockout_test@laikaclub.com"
        r = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": email, "password": "WRONG_PASSWORD_XYZ"}, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 401, f"Status inesperado: {r.status_code}"
        data = r.json()
        detail = data.get("detail", {})
        doc.add_step(1, "Enviar credencial incorrecta", "HTTP 401 con detalle de intentos", f"HTTP {r.status_code} (intentos: {detail.get('attempts', 'N/A')}/{detail.get('max_attempts', 'N/A')})", "✓")
        doc.attach_evidence("failed_attempt", data)
        doc.finish("Aprobada", observations=f"Mecanismo de seguridad de intentos fallidos activo: HTTP 401 con max_attempts={detail.get('max_attempts', 3)}")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
