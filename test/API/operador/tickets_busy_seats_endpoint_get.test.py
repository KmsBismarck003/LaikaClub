import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-053", "tickets_busy_seats_endpoint_get", "API / Operador",
                             level="API", test_type="Funcional / Taquilla", technique="Caja negra")
    doc.set_metadata("Validar que GET /api/tickets/busy-seats/{eventId} entregue la lista de asientos ocupados.",
                     "Comprobar disponibilidad de mapa de asientos bloqueados para taquilla y acomodación",
                     "Evento 100001 activo en laika_tickets", "EventId: 100001")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        event_id = 100001
        r = requests.get(f"{GATEWAY_URL}/api/tickets/busy-seats/{event_id}", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, f"Consultar GET /api/tickets/busy-seats/{event_id}", "HTTP 200 OK", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert isinstance(data, list), "El resultado debe ser un array"
        
        doc.attach_evidence("busy_seats_data", {"eventId": event_id, "busySeatsCount": len(data)})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} asientos bloqueados listados")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
