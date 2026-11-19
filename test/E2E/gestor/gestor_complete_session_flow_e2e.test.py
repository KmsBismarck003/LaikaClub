import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_GESTOR_EMAIL, QA_GESTOR_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-047", "gestor_complete_session_flow_e2e", "E2E / Gestor",
                             level="E2E", test_type="End-to-End / Flujo Completo", technique="Caja negra")
    doc.set_metadata("Ejecutar flujo completo de sesión y supervisión del Gestor",
                     "Login -> Métricas Dashboard -> Listado de Eventos -> Detalle de Boletos y Revenue -> Mercancía -> Logout",
                     "Credenciales oficiales de Gestor", "Sesión interactiva completa")
    doc.start()
    # 1. Login
    r_login = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": QA_GESTOR_EMAIL, "password": QA_GESTOR_PASSWORD}, timeout=10)
    token = (r_login.json() or {}).get("token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    login_ok = r_login.status_code == 200 and token is not None
    doc.add_step(1, "Iniciar sesión como Gestor", "HTTP 200 con JWT", f"HTTP {r_login.status_code}", "✓" if login_ok else "✗")

    # 2. Dashboard
    r_dash = requests.get(f"{GATEWAY_URL}/api/stats/manager/dashboard", headers=headers, timeout=10)
    dash_ok = r_dash.status_code == 200
    doc.add_step(2, "Consultar métricas generales del dashboard", "HTTP 200", f"HTTP {r_dash.status_code}", "✓" if dash_ok else "✗")

    # 3. Events List
    r_evs = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    evs_data = r_evs.json() if r_evs.status_code == 200 else []
    evs_ok = r_evs.status_code == 200 and len(evs_data) > 0
    doc.add_step(3, "Consultar catálogo de eventos asignados", "HTTP 200 con eventos", f"HTTP {r_evs.status_code}, total={len(evs_data)}", "✓" if evs_ok else "✗")

    # 4. Revenue Check
    first_id = evs_data[0].get("id") if evs_data else 100001
    r_rev = requests.get(f"{GATEWAY_URL}/api/manager/events/{first_id}/revenue", headers=headers, timeout=10)
    rev_ok = r_rev.status_code == 200
    doc.add_step(4, f"Auditar ingresos del evento {first_id}", "HTTP 200", f"HTTP {r_rev.status_code}", "✓" if rev_ok else "✗")

    # 5. Merch
    r_merch = requests.get(f"{GATEWAY_URL}/api/merchandise?manager_id=3", headers=headers, timeout=10)
    merch_ok = r_merch.status_code == 200
    doc.add_step(5, "Verificar catálogo de mercancía oficial", "HTTP 200", f"HTTP {r_merch.status_code}", "✓" if merch_ok else "✗")

    # 6. Logout
    r_logout = requests.post(f"{GATEWAY_URL}/api/auth/logout", headers=headers, timeout=10)
    logout_ok = r_logout.status_code in [200, 204]
    doc.add_step(6, "Cerrar sesión de Gestor", "HTTP 200/204", f"HTTP {r_logout.status_code}", "✓" if logout_ok else "✗")

    success = login_ok and dash_ok and evs_ok and rev_ok and merch_ok and logout_ok
    doc.attach_evidence("e2e_session", {"login": login_ok, "dashboard": dash_ok, "events": evs_ok, "revenue": rev_ok, "merch": merch_ok, "logout": logout_ok})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
