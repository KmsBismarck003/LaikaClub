import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

USER_AGENTS = {
    "Zebra Scanner": "Mozilla/5.0 (Linux; Android 10; Zebra TC26 Build/10-16-10) AppleWebKit/537.36",
    "Honeywell EDA51": "Mozilla/5.0 (Linux; Android 8.1.0; EDA51 Build/18.01.10) AppleWebKit/537.36",
    "Mobile Safari": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    "Chrome Android": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36"
}

def run_test():
    doc = TestCaseDocumenter("CP-OPE-037", "operador_handheld_scanners_ct", "CT / Operador",
                             level="CT", test_type="Compatibilidad / Dispositivos", technique="Caja negra")
    doc.set_metadata("Comprobar compatibilidad con terminales portátiles y lectores industriales",
                     "Garantizar HTTP 200 ante peticiones desde Zebra, Honeywell, Mobile Safari y Chrome Android",
                     "User-Agents representativos de lectores ópticos", "Zebra, Honeywell, Mobile")
    doc.start()
    headers = get_operador_auth_headers()
    all_ok = True
    for device, ua in USER_AGENTS.items():
        h = headers.copy()
        h["User-Agent"] = ua
        payload = {"ticketCode": "TKT-C853F390"}
        resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=h, json=payload, timeout=10)
        dev_ok = resp.status_code == 200
        all_ok = all_ok and dev_ok
        doc.add_step(len(doc.steps)+1, f"Petición desde {device}", "HTTP 200", f"HTTP {resp.status_code}", "✓" if dev_ok else "✗")

    doc.attach_evidence("handheld_scanners_ct", {"success": all_ok})
    doc.finish("Aprobada" if all_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
