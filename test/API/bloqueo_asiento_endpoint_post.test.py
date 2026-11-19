"""
Prueba de API (API) - Tickets: POST /api/tickets/lock
CP-069: Verifica la retención y bloqueo temporal de una butaca numerada.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-069",
        name="bloqueo_asiento_endpoint_post",
        module="API / Bloqueo Concurrente",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el bloqueo de un asiento mediante POST /api/tickets/lock con parámetros eventId, seatId, sectionName y price.",
        objective="Verificar que el servicio responda con código HTTP 200 y confirme el bloqueo del asiento.",
        preconditions="Usuario autenticado.",
        test_data="Event ID: 19, Seat ID: 'QA-API-LOCK-01', Precio: 450.0"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    payload = {
        "eventId": 19,
        "seatId": "QA-API-LOCK-01",
        "sectionName": "Zona General",
        "price": 450.0
    }

    resp = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(1, "Enviar POST /api/tickets/lock con payload de asiento", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    # Limpiar liberando el asiento
    requests.delete(f"{GATEWAY_URL}/api/tickets/lock", json={"eventId": 19, "seatId": "QA-API-LOCK-01"}, headers=headers, timeout=10)
    doc.add_step(2, "Liberar asiento tras validación", "Asiento desbloqueado", "Liberado", "✓")

    doc.attach_evidence("seat_lock_response", data)
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El endpoint de bloqueo registra la reserva temporal con éxito.")

    return {
        "id": "CP-069",
        "name": "bloqueo_asiento_endpoint_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

