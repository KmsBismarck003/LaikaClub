import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-025", "flujo_auth_sqli_payload_login_post", "Seguridad / Inyección",
                             level="SECURITY", test_type="Seguridad / Inyección SQL", technique="Caja negra")
    doc.set_metadata("Validar blindaje de validación: intercepción y rechazo ante inyección SQL en login",
                     "Comprobar que payloads maliciosos sean interceptados sin vulnerar la base de datos",
                     "Servicio laika_gateway y laika_auth activos", "Email: ' OR 1=1 --")
    doc.start()
    try:
        payload = {"email": "' OR 1=1 --", "password": "any"}
        r = requests.post(f"{GATEWAY_URL}/api/auth/login", json=payload, timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [401, 422], f"Status inesperado ante SQLi: {r.status_code}"
        doc.add_step(1, "Enviar payload SQLi en login", "HTTP 401 o 422 de intercepción", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("sqli_login_response", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Intento de inyección interceptado de forma segura: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
