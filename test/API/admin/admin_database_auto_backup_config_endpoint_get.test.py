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
    doc = TestCaseDocumenter("CP-ADM-068", "admin_database_auto_backup_config_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Configuración", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/database/automatic-backup/config",
                     "Validar respuesta HTTP 200 y configuración de respaldos automáticos",
                     "Admin autenticado", "GET /api/database/automatic-backup/config")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/automatic-backup/config"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/automatic-backup/config", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_config = "config" in data
    doc.add_step(2, "Verificar objeto config", "config presente", f"data={data}", "✓" if has_config else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    success = status_ok and has_config
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
