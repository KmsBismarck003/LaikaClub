import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_OPERADOR_EMAIL, QA_OPERADOR_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-043", "operador_complete_terminal_shift_e2e", "E2E / Operador",
                             level="E2E", test_type="End-to-End / Flujo Completo", technique="Caja negra")
    doc.set_metadata("Ejecutar turno operativo completo del Operador en terminal de acceso",
                     "Login -> Métricas Staff -> Escaneo Válido -> Escaneo Inválido -> Consulta Historial -> Logout",
                     "Credenciales oficiales de Operador", "Turno operativo interactivo completo")
    doc.start()
    # 1. Login
    r_login = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": QA_OPERADOR_EMAIL, "password": QA_OPERADOR_PASSWORD}, timeout=10)
    token = (r_login.json() or {}).get("token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    login_ok = r_login.status_code == 200 and token is not None
    doc.add_step(1, "Iniciar sesión como Operador", "HTTP 200 con JWT", f"HTTP {r_login.status_code}", "✓" if login_ok else "✗")

    # 2. Staff Dashboard
    r_dash = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=10)
    dash_ok = r_dash.status_code == 200
    doc.add_step(2, "Consultar métricas de staff", "HTTP 200", f"HTTP {r_dash.status_code}", "✓" if dash_ok else "✗")

    # 3. Escaneo Válido
    r_valid = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json={"ticketCode": "TKT-C853F390"}, timeout=10)
    valid_ok = r_valid.status_code == 200 and "statusCode" in r_valid.json()
    doc.add_step(3, "Escanear boleto registrado", "HTTP 200 con estado", f"HTTP {r_valid.status_code}", "✓" if valid_ok else "✗")

    # 4. Escaneo Inválido
    r_inv = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json={"ticketCode": "TKT-INVALID-SHIFT"}, timeout=10)
    inv_ok = r_inv.status_code == 200 and r_inv.json().get("statusCode") == "INVALID_CODE"
    doc.add_step(4, "Escanear boleto apócrifo", "HTTP 200 con INVALID_CODE", f"HTTP {r_inv.status_code}", "✓" if inv_ok else "✗")

    # 5. Historial de Validaciones
    r_hist = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=10)
    hist_ok = r_hist.status_code == 200 and isinstance(r_hist.json(), list)
    doc.add_step(5, "Auditar bitácora de turno", "HTTP 200 con logs", f"HTTP {r_hist.status_code}, total={len(r_hist.json()) if hist_ok else 'N/A'}", "✓" if hist_ok else "✗")

    # 6. Logout
    r_logout = requests.post(f"{GATEWAY_URL}/api/auth/logout", headers=headers, timeout=10)
    logout_ok = r_logout.status_code in [200, 204]
    doc.add_step(6, "Cerrar sesión de Operador", "HTTP 200/204", f"HTTP {r_logout.status_code}", "✓" if logout_ok else "✗")

    success = login_ok and dash_ok and valid_ok and inv_ok and hist_ok and logout_ok
    doc.attach_evidence("e2e_operator_shift", {"login": login_ok, "dashboard": dash_ok, "scan_valid": valid_ok, "scan_inv": inv_ok, "history": hist_ok, "logout": logout_ok})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
