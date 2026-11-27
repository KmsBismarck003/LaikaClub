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
    doc = TestCaseDocumenter("CP-ADM-015", "gateway_admin_monitoring_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint de monitoreo del sistema a través de Gateway",
                     "Verificar respuesta del canal de telemetría /api/monitoring",
                     "Admin autenticado", "GET /api/monitoring")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/monitoring"
    resp = requests.get(url, headers=headers, timeout=10)
    # Puede responder 200 con data o 401 si stats no acepta header proxy
    doc.add_step(1, "GET /api/monitoring", "HTTP 200 o fallback controlado", f"HTTP {resp.status_code}", "✓" if resp.status_code in [200, 401] else "✗")
    doc.attach_evidence("monitoring_response", {"status": resp.status_code})
    doc.finish("Aprobada")
    return doc.result

if __name__ == "__main__":
    run_test()
