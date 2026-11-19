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
    doc = TestCaseDocumenter("CP-ADM-069", "admin_database_auto_backup_config_endpoint_put", "API / Admin",
                             level="API", test_type="Funcional / Configuración", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint PUT /api/database/automatic-backup/config",
                     "Garantizar actualización de parámetros de respaldos automáticos",
                     "Admin autenticado", "PUT /api/database/automatic-backup/config")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/automatic-backup/config"
    payload = {
        "enabled": True,
        "frequency": "daily",
        "time": "03:00",
        "retentionDays": 15,
        "type": "incremental"
    }
    resp = requests.put(url, json=payload, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "PUT /api/database/automatic-backup/config", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
