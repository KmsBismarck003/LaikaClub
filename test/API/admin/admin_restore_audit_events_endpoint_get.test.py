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
    doc = TestCaseDocumenter("CP-ADM-084", "admin_restore_audit_events_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Auditoría", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/restore-audit/events",
                     "Validar respuesta HTTP 200 con listado de eventos de restauración",
                     "Admin autenticado", "GET /api/restore-audit/events")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/restore-audit/events"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/restore-audit/events", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_events = "events" in data
    doc.add_step(2, "Verificar lista de eventos", "events presente", f"total={data.get('total')}", "✓" if has_events else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    success = status_ok and has_events
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
