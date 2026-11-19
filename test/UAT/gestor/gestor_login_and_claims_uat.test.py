import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_GESTOR_EMAIL, QA_GESTOR_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-021", "gestor_login_and_claims_uat", "UAT / Gestor",
                             level="UAT", test_type="Aceptación / Autenticación", technique="Caja negra")
    doc.set_metadata("Comprobar proceso de login y emisión de claims de rol gestor",
                     "Garantizar que el gestor inicie sesión y reciba role='gestor'",
                     "Credenciales oficiales de gestor", f"email={QA_GESTOR_EMAIL}")
    doc.start()
    resp = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": QA_GESTOR_EMAIL, "password": QA_GESTOR_PASSWORD}, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    has_token = bool(data.get("token"))
    role = (data.get("user") or {}).get("role")
    ok = resp.status_code == 200 and has_token and role == "gestor"
    doc.add_step(1, "Autenticar gestor", "HTTP 200 con token y role='gestor'", f"HTTP {resp.status_code}, role={role}", "✓" if ok else "✗")
    doc.attach_evidence("gestor_login_uat", {"status": resp.status_code, "role": role, "token_present": has_token})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
