import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-017", "admin_user_filtering_by_role_st", "ST / Admin",
                             level="ST", test_type="Funcional / Filtros", technique="Caja negra")
    doc.set_metadata("Comprobar filtrado de usuarios por rol en la consola de administración",
                     "Garantizar que al filtrar por role=gestor solo se retornen gestores",
                     "Admin autenticado", "GET /api/admin/users?role=gestor")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?role=gestor&limit=10"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Consultar usuarios con role=gestor", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    users = data.get("users", [])
    all_gestores = all(u.get("role") == "gestor" for u in users) if users else True
    doc.add_step(2, "Verificar rol de los usuarios devueltos", "Todos con role=='gestor'", f"Total evaluados: {len(users)}, all_gestores={all_gestores}", "✓" if all_gestores else "✗")

    doc.attach_evidence("filter_role_output", {"status": resp.status_code, "users_count": len(users), "all_match": all_gestores})
    success = status_ok and all_gestores
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
