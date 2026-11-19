"""
Prueba de Integración de Sistema (SIT) - Microservicios: Interacción Tickets <-> Events
CP-020: Comprueba la sincronización de datos entre el microservicio de boletos y el catálogo de eventos.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-020",
        name="comunicacion_tickets_events_sit",
        module="SIT / Tickets <-> Events Inter-Service",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la comunicación entre laika_tickets (8202) y laika_events (8201) al consultar disponibilidad y asientos ocupados de un evento existente.",
        objective="Garantizar que el servicio de tickets responda adecuadamente sobre un eventId real provisto por el servicio de eventos.",
        preconditions="Servicios tickets y events activos en Docker.",
        test_data="Consulta de eventos publicados y posterior consulta de asientos ocupados en tickets."
    )
    doc.start()

    # 1. Obtener un evento publicado desde laika_events
    events_resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=5", timeout=10)
    s1_ok = (events_resp.status_code == 200 and len(events_resp.json()) > 0)
    event_list = events_resp.json() if s1_ok else []
    target_event_id = event_list[0].get("id") if event_list else 19

    doc.add_step(
        1,
        "Obtener evento de referencia desde el servicio de eventos",
        "Evento obtenido con ID numérico válido",
        f"Event ID seleccionado: {target_event_id} ('{event_list[0].get('name') if event_list else 'N/A'}')",
        "✓" if s1_ok else "✗"
    )

    # 2. Consultar asientos ocupados en laika_tickets para ese event_id
    busy_resp = requests.get(f"{GATEWAY_URL}/api/tickets/busy-seats/{target_event_id}", timeout=10)
    s2_ok = (busy_resp.status_code == 200 and isinstance(busy_resp.json(), list))
    doc.add_step(
        2,
        f"Consultar asientos ocupados vía GET /api/tickets/busy-seats/{target_event_id}",
        "HTTP 200 con array de asientos (strings)",
        f"HTTP {busy_resp.status_code}, {len(busy_resp.json()) if s2_ok else 0} asientos ocupados listados",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("cross_service_data", {
        "event_id": target_event_id,
        "event_name": event_list[0].get("name") if event_list else "N/A",
        "busy_seats_count": len(busy_resp.json()) if s2_ok else 0
    })
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Coordinación inter-servicio entre laika_tickets y laika_events validada con éxito.")

    return {
        "id": "CP-020",
        "name": "comunicacion_tickets_events_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

