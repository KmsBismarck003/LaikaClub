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
    doc = TestCaseDocumenter("CP-ADM-062", "admin_database_stats_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Base de Datos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/database/stats",
                     "Garantizar respuesta HTTP 200 con estadísticas de tamaño e índices",
                     "Admin autenticado", "GET /api/database/stats")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/stats"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/stats", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
