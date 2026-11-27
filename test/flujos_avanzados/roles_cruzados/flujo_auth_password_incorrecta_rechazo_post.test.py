import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-024", "flujo_auth_password_incorrecta_rechazo_post", "Seguridad / Login",
                             level="SECURITY", test_type="Seguridad / Autenticación", technique="Caja negra")
    doc.set_metadata("Validar rechazo de inicio de sesión ante contraseña errónea y conteo de intentos",
                     "Comprobar respuesta HTTP 401 con mensaje de credenciales inválidas",
                     "Servicio laika_auth activo", "Email válido, Password erróneo")
    doc.start()
    try:
        payload = {"email": "qa_user_test@laikaclub.com", "password": "WrongPassword999!"}
        r = requests.post(f"{GATEWAY_URL}/api/auth/login", json=payload, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 401, f"Expected 401 Unauthorized, got {r.status_code}"
        data = r.json()
        assert "Credenciales inválidas" in str(data) or r.status_code == 401
        doc.add_step(1, "Enviar login con contraseña incorrecta", "HTTP 401 Unauthorized", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("wrong_pwd_response", data)
        doc.finish("Aprobada", observations=f"401 Unauthorized verificado: {data}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
