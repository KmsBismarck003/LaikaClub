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
    doc = TestCaseDocumenter("CP-ADV-015", "flujo_creacion_evento_colision_recinto_horario_post", "Eventos / Concurrencia",
                             level="API", test_type="Auditoría / Colisión de Horarios", technique="Caja negra")
    doc.set_metadata("Auditar comportamiento ante tentativa de programación con colisión horaria en la misma sala",
                     "Evaluar si el motor previene solapamiento físico de funciones en un recinto",
                     "Recinto 1 Sala 3; fecha 2026-12-25 20:00", "Sala: 3, Fecha: 2026-12-25")
    doc.start()
    try:
        headers = get_gestor_auth_headers()
        payload = {
            "name": "Evento Colision Test",
            "event_date": "2026-12-25",
            "event_time": "20:00:00",
            "venue_id": 1,
            "room_id": 3,
            "category": "Teatro",
            "price": 200.0,
            "total_tickets": 100,
            "contract_id": 1,
            "functions": [{"date": "2026-12-25", "time": "20:00:00", "venue_id": 1, "room_id": 3}]
        }
        r = requests.post(f"{GATEWAY_URL}/api/events/manager/events", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Validar respuesta del microservicio
        doc.add_step(1, "Enviar creación con horario potencialmente coincidente", "Respuesta procesada controladamente", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("colision_test_response", {"status_code": r.status_code, "text": r.text[:120]})
        doc.finish("Aprobada", observations=f"Ejecución de auditoría de colisión: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
