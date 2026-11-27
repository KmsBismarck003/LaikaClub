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
    doc = TestCaseDocumenter("CP-ADM-041", "compatibilidad_user_agents_admin_ct", "CT / Admin",
                             level="CT", test_type="Compatibilidad / Headers", technique="Caja negra")
    doc.set_metadata("Validar compatibilidad de API Admin con cabeceras User-Agent de navegadores modernos",
                     "Comprobar funcionamiento idéntico con Chrome, Firefox, Edge y Safari",
                     "Admin autenticado", "GET /api/admin/users")
    doc.start()
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    ]
    all_ok = True
    base_headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users?limit=1"

    for idx, ua in enumerate(user_agents, start=1):
        h = base_headers.copy()
        h["User-Agent"] = ua
        r = requests.get(url, headers=h, timeout=10)
        ok = r.status_code == 200
        all_ok = all_ok and ok
        doc.add_step(idx, f"Petición con User-Agent #{idx}", "HTTP 200", f"HTTP {r.status_code}", "✓" if ok else "✗")

    doc.attach_evidence("user_agents_tested", {"total": len(user_agents), "compatible": all_ok})
    doc.finish("Aprobada" if all_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
