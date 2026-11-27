import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-049", "manager_events_create_endpoint_post", "API / Gestor",
                             level="API", test_type="Funcional / Eventos", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/manager/events",
                     "Validar creación correcta de un nuevo evento por el gestor",
                     "Gestor autenticado", "POST /api/manager/events")
    doc.start()
    headers = get_gestor_auth_headers()
    payload = {
        "name": "QA Festival Automatizado Gestor",
        "description": "Evento de validación de API para gestor",
        "event_date": "2026-12-20",
        "event_time": "18:00",
        "location": "Explanada Laika",
        "category": "FESTIVAL",
        "price": 550.0,
        "total_tickets": 300,
        "available_tickets": 300,
        "status": "draft"
    }
    resp = requests.post(f"{GATEWAY_URL}/api/manager/events", headers=headers, json=payload, timeout=10)
    created_ok = resp.status_code in [200, 201]
    ev_id = (resp.json() or {}).get("id") if created_ok else None
    doc.add_step(1, "POST /api/manager/events", "HTTP 200/201 con ID generado", f"HTTP {resp.status_code}, ID={ev_id}", "✓" if created_ok and ev_id else "✗")

    # Limpieza inmediata para no ensuciar la base de datos
    if ev_id:
        requests.put(f"{GATEWAY_URL}/api/events/{ev_id}", headers=headers, json={"status": "deleted"}, timeout=5)

    doc.attach_evidence("http_response", {"status": resp.status_code, "created_id": ev_id})
    doc.finish("Aprobada" if (created_ok and ev_id) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
