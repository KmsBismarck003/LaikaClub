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
    doc = TestCaseDocumenter("CP-ADM-045", "exploratorio_paginacion_limites_extremos_et", "ET / Admin",
                             level="ET", test_type="Exploratorio / Casos Límite", technique="Caja negra")
    doc.set_metadata("Exploración de valores extremos en paginación de usuarios (page=999999, limit=0)",
                     "Garantizar que no se produzcan caídas de servidor ni excepciones no controladas",
                     "Admin autenticado", "GET /api/admin/users?page=999999&limit=0")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?page=999999&limit=0"
    resp = requests.get(url, headers=headers, timeout=10)
    safe = resp.status_code in [200, 400]
    doc.add_step(1, "Solicitar página 999999 con limit=0", "HTTP 200 o 400 manejado", f"HTTP {resp.status_code}", "✓" if safe else "✗")

    doc.attach_evidence("extreme_pagination", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if safe else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
