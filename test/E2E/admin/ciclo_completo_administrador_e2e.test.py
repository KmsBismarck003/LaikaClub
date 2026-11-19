import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-047", "ciclo_completo_administrador_e2e", "E2E / Admin",
                             level="E2E", test_type="End-to-End Flujo Completo", technique="Caja negra")
    doc.set_metadata("Ciclo completo integral del rol Administrador",
                     "Login -> Inspección Dashboard -> Monitoreo Tablas -> Búsqueda Usuarios -> Configuración Global -> Logout",
                     "Ambiente en vivo microservicios", "Flujo E2E Admin")
    doc.start()

    # 1. Login
    r_login = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": QA_ADMIN_EMAIL, "password": QA_ADMIN_PASSWORD}, timeout=10)
    login_ok = r_login.status_code == 200
    token = r_login.json().get("token") if login_ok else None
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    doc.add_step(1, "Iniciar sesión Administrador", "HTTP 200 y Token", f"HTTP {r_login.status_code}", "✓" if login_ok and token else "✗")

    # 2. Dashboard Stats
    r_stats = requests.get(f"{GATEWAY_URL}/api/stats/admin/dashboard", headers=headers, timeout=10)
    stats_ok = r_stats.status_code == 200
    doc.add_step(2, "Consultar métricas ejecutivas en Dashboard", "HTTP 200", f"HTTP {r_stats.status_code}", "✓" if stats_ok else "✗")

    # 3. Tablas DB
    r_db = requests.get(f"{GATEWAY_URL}/api/database/tables", headers=headers, timeout=10)
    db_ok = r_db.status_code == 200
    doc.add_step(3, "Inspeccionar catálogo de tablas físicas", "HTTP 200", f"HTTP {r_db.status_code}", "✓" if db_ok else "✗")

    # 4. Usuarios
    r_users = requests.get(f"{GATEWAY_URL}/api/admin/users?limit=5", headers=headers, timeout=10)
    users_ok = r_users.status_code == 200
    doc.add_step(4, "Consultar directorio general de usuarios", "HTTP 200", f"HTTP {r_users.status_code}", "✓" if users_ok else "✗")

    # 5. Config
    r_cfg = requests.get(f"{GATEWAY_URL}/api/config", headers=headers, timeout=10)
    cfg_ok = r_cfg.status_code == 200
    doc.add_step(5, "Verificar parámetros de configuración", "HTTP 200", f"HTTP {r_cfg.status_code}", "✓" if cfg_ok else "✗")

    # 6. Logout
    r_logout = requests.post(f"{GATEWAY_URL}/api/auth/logout", headers=headers, timeout=10)
    logout_ok = r_logout.status_code == 200
    doc.add_step(6, "Cerrar sesión de Administrador", "HTTP 200", f"HTTP {r_logout.status_code}", "✓" if logout_ok else "✗")

    doc.attach_evidence("admin_e2e_summary", {"login": login_ok, "stats": stats_ok, "db": db_ok, "users": users_ok, "cfg": cfg_ok, "logout": logout_ok})
    success = login_ok and stats_ok and db_ok and users_ok and cfg_ok and logout_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
