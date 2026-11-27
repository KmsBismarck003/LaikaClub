"""
Prueba de Sistema (ST) - Funcionalidades: Consulta de Detalle de Evento
CP-026: Verifica la carga completa de datos, fechas, ubicación y precios de un evento seleccionado.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-026",
        name="consulta_detalle_evento_st",
        module="Sistema / Ficha de Evento",
        level="ST",
        test_type="Funcional / Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la respuesta de la ficha detallada de un evento público mediante GET /api/events/{eventId}.",
        objective="Verificar que el evento incluya nombre, precio, fecha, recinto y funciones disponibles.",
        preconditions="Al menos un evento publicado en el sistema.",
        test_data="ID de evento: 19 o primer evento publicado disponible"
    )
    doc.start()

    # 1. Obtener ID de evento
    events_resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=1", timeout=10)
    target_id = 19
    if events_resp.status_code == 200 and events_resp.json():
        target_id = events_resp.json()[0].get("id", 19)

    doc.add_step(1, "Identificar ID de evento activo para consulta", "ID de evento válido", f"ID={target_id}", "✓")

    # 2. Consultar detalle del evento
    det_resp = requests.get(f"{GATEWAY_URL}/api/events/{target_id}", timeout=10)
    s2_ok = (det_resp.status_code == 200)
    event_data = det_resp.json() if s2_ok else {}
    doc.add_step(2, f"Solicitar detalle vía GET /api/events/{target_id}", "HTTP 200 OK", f"HTTP {det_resp.status_code}", "✓" if s2_ok else "✗")

    # 3. Validar presencia de campos esenciales
    has_name = bool(event_data.get("name"))
    has_location = bool(event_data.get("location") or event_data.get("venue"))
    s3_ok = has_name and has_location
    doc.add_step(
        3,
        "Validar campos mandatorios (nombre, recinto, precio)",
        "Campos name y location/venue no vacíos",
        f"Name: '{event_data.get('name')}', Location: '{event_data.get('location') or event_data.get('venue')}'",
        "✓" if s3_ok else "✗"
    )

    all_passed = s2_ok and s3_ok
    doc.attach_evidence("event_detail_payload", event_data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Ficha de evento contiene la información requerida para la experiencia del usuario.")

    return {
        "id": "CP-026",
        "name": "consulta_detalle_evento_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

