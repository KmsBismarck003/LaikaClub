import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_OPERADOR_EMAIL, QA_OPERADOR_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-019", "operador_login_and_claims_uat", "UAT / Operador",
                             level="UAT", test_type="Aceptación / Autenticación", technique="Caja negra")
    doc.set_metadata("Comprobar proceso de autenticación y entrega de permisos de Operador",
                     "Garantizar que el operador inicie sesión y reciba role='operador'",
                     "Credenciales oficiales de operador", f"email={QA_OPERADOR_EMAIL}")
    doc.start()
    resp = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": QA_OPERADOR_EMAIL, "password": QA_OPERADOR_PASSWORD}, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_token = bool(data.get("token"))
    role = (data.get("user") or {}).get("role")
    ok = resp.status_code == 200 and has_token and role == "operador"
    doc.add_step(1, "Autenticar operador", "HTTP 200 con token y role='operador'", f"HTTP {resp.status_code}, role={role}", "✓" if ok else "✗")
    doc.attach_evidence("operador_login_uat", {"status": resp.status_code, "role": role, "token_present": has_token})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
