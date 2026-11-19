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
    doc = TestCaseDocumenter("CP-ADM-030", "regresion_contrato_admin_users_rt", "RT / Admin",
                             level="RT", test_type="Regresión / Contratos", technique="Caja negra")
    doc.set_metadata("Validar contrato de respuesta JSON del endpoint /api/admin/users",
                     "Garantizar que el contrato DTO conserve total, users con id, email, role, status",
                     "Admin autenticado", "GET /api/admin/users")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?limit=2"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Solicitar usuarios para validar contrato DTO", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_total = "total" in data and isinstance(data["total"], int)
    has_users = "users" in data and isinstance(data["users"], list)
    user_keys_ok = True
    if has_users and len(data["users"]) > 0:
        first = data["users"][0]
        user_keys_ok = all(k in first for k in ["id", "email", "role", "status"])
    doc.add_step(2, "Verificar campos obligatorios del esquema", "Esquema íntegro", f"total={has_total}, users={has_users}, fields={user_keys_ok}", "✓" if (has_total and has_users and user_keys_ok) else "✗")

    doc.attach_evidence("contract_sample", {"total": data.get("total"), "sample_user": data.get("users", [{}])[0] if data.get("users") else {}})
    success = status_ok and has_total and has_users and user_keys_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
