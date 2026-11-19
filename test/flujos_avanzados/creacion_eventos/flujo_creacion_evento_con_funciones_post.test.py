import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-014", "flujo_creacion_evento_con_funciones_post", "Eventos / Creación",
                             level="API", test_type="Funcional / Ciclo de Vida", technique="Caja negra")
    doc.set_metadata("Validar creación completa de evento por gestor con funciones, recinto y aforo en laika_events",
                     "Comprobar persistencia de nuevo evento en borrador con su función horaria",
                     "Servicio laika_events activo; token de gestor", "Evento: Concierto Auditoria QA 2026")
    doc.start()
    try:
        headers = get_gestor_auth_headers()
        payload = {
            "name": "Concierto Auditoria QA 2026",
            "description": "Prueba integral de creacion de evento",
            "event_date": "2026-12-20",
            "event_time": "21:00:00",
            "location": "Zapopan, Jalisco",
            "venue": "Teatro Diana",
            "venue_id": 1,
            "room_id": 3,
            "category": "Conciertos",
            "price": 350.0,
            "total_tickets": 150,
            "available_tickets": 150,
            "contract_id": 1,
            "status": "draft",
            "functions": [{"date": "2026-12-20", "time": "21:00:00", "venue_id": 1, "room_id": 3}]
        }
        r = requests.post(f"{GATEWAY_URL}/api/events/manager/events", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}"
        data = r.json()
        event_id = data.get("id") or data.get("event", {}).get("id")
        assert event_id is not None, "No se retorno ID de evento creado"
        doc.add_step(1, "Crear evento con función horaria", "HTTP 200 con ID de evento", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("created_event", {"id": event_id, "name": payload["name"]})
        doc.finish("Aprobada", observations=f"Evento creado exitosamente con ID {event_id}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
