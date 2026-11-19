import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

USER_AGENTS = {
    "Chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Safari": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Edge": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
}

def run_test():
    doc = TestCaseDocumenter("CP-GES-041", "gestor_desktop_user_agents_ct", "CT / Gestor",
                             level="CT", test_type="Compatibilidad / Navegadores", technique="Caja negra")
    doc.set_metadata("Comprobar consistencia de respuestas con diferentes navegadores web",
                     "Garantizar HTTP 200 en /api/manager/events para Chrome, Firefox, Safari y Edge",
                     "User-Agents representativos de escritorio", "Chrome, Firefox, Safari, Edge")
    doc.start()
    headers = get_gestor_auth_headers()
    all_ok = True
    for browser, ua in USER_AGENTS.items():
        h = headers.copy()
        h["User-Agent"] = ua
        resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=h, timeout=10)
        browser_ok = resp.status_code == 200
        all_ok = all_ok and browser_ok
        doc.add_step(len(doc.steps)+1, f"Petición desde {browser}", "HTTP 200", f"HTTP {resp.status_code}", "✓" if browser_ok else "✗")

    doc.attach_evidence("user_agent_tests", {"success": all_ok})
    doc.finish("Aprobada" if all_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
