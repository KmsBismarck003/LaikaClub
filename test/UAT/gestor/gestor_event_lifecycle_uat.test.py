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
    doc = TestCaseDocumenter("CP-GES-022", "gestor_event_lifecycle_uat", "UAT / Gestor",
                             level="UAT", test_type="Aceptación / Ciclo de Vida", technique="Caja negra")
    doc.set_metadata("Comprobar ciclo de vida completo de evento por el Gestor",
                     "Alta en borrador -> Publicación -> Despublicación -> Eliminación lógica",
                     "Gestor autenticado", "POST /api/manager/events y transiciones PATCH/PUT")
    doc.start()
    headers = get_gestor_auth_headers()
    payload = {
        "name": "UAT Evento Ciclo Gestor",
        "description": "Prueba de aceptación de usuario para ciclo de vida",
        "event_date": "2026-12-15",
        "event_time": "19:00",
        "location": "Centro de Convenciones",
        "category": "CONFERENCIA",
        "price": 300.0,
        "total_tickets": 200,
        "available_tickets": 200,
        "status": "draft"
    }
    r_create = requests.post(f"{GATEWAY_URL}/api/manager/events", headers=headers, json=payload, timeout=10)
    created_ok = r_create.status_code in [200, 201]
    ev_data = r_create.json() if created_ok else {}
    ev_id = ev_data.get("id") or ev_data.get("event_id")
    doc.add_step(1, "Crear evento borrador", "HTTP 200/201 con ID generado", f"HTTP {r_create.status_code}, ID={ev_id}", "✓" if created_ok and ev_id else "✗")

    pub_ok = False
    unpub_ok = False
    del_ok = False
    if ev_id:
        r_pub = requests.patch(f"{GATEWAY_URL}/api/manager/events/{ev_id}/publish", headers=headers, timeout=10)
        pub_ok = r_pub.status_code == 200
        doc.add_step(2, "Publicar evento", "HTTP 200", f"HTTP {r_pub.status_code}", "✓" if pub_ok else "✗")

        r_unpub = requests.patch(f"{GATEWAY_URL}/api/manager/events/{ev_id}/unpublish", headers=headers, timeout=10)
        unpub_ok = r_unpub.status_code == 200
        doc.add_step(3, "Mover a borrador (unpublish)", "HTTP 200", f"HTTP {r_unpub.status_code}", "✓" if unpub_ok else "✗")

        r_del = requests.put(f"{GATEWAY_URL}/api/events/{ev_id}", headers=headers, json={"status": "deleted"}, timeout=10)
        del_ok = r_del.status_code == 200
        doc.add_step(4, "Eliminar evento", "HTTP 200", f"HTTP {r_del.status_code}", "✓" if del_ok else "✗")

    success = created_ok and pub_ok and unpub_ok and del_ok
    doc.attach_evidence("uat_lifecycle", {"create": r_create.status_code, "publish": pub_ok, "unpublish": unpub_ok, "delete": del_ok})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
