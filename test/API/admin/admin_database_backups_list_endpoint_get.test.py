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
    doc = TestCaseDocumenter("CP-ADM-063", "admin_database_backups_list_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Backups", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/database/backups",
                     "Validar listado de respaldos generados en el sistema",
                     "Admin autenticado", "GET /api/database/backups")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/backups"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/backups", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_backups = "backups" in data and isinstance(data["backups"], list)
    doc.add_step(2, "Verificar lista de respaldos", "backups presente", f"Total: {data.get('total')}", "✓" if has_backups else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "total": data.get("total")})
    success = status_ok and has_backups
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
