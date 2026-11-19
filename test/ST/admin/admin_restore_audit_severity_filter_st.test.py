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
    doc = TestCaseDocumenter("CP-ADM-020", "admin_restore_audit_severity_filter_st", "ST / Admin",
                             level="ST", test_type="Funcional / Auditoría", technique="Caja negra")
    doc.set_metadata("Comprobar filtrado por severidad en auditoría de restauración",
                     "Verificar que la consulta por severidad 'critical' responde correctamente",
                     "Admin autenticado", "GET /api/restore-audit/events?severity=critical")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/restore-audit/events?severity=critical"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Consultar eventos de severidad crítica", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    events = data.get("events", [])
    all_critical = all(e.get("severity") == "critical" for e in events) if events else True
    doc.add_step(2, "Verificar filtro de severidad", "Todos con severity=='critical'", f"Eventos: {len(events)}", "✓" if all_critical else "✗")

    doc.attach_evidence("restore_audit_filter", {"status": resp.status_code, "count": len(events)})
    success = status_ok and all_critical
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
