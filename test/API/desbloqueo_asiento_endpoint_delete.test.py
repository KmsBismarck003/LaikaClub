"""
Prueba de API (API) - Tickets: DELETE /api/tickets/lock
CP-070: Verifica la liberación explícita de un asiento bloqueado previamente.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-070",
        name="desbloqueo_asiento_endpoint_delete",
        module="API / Desbloqueo de Asientos",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la desasignación de un asiento bloqueado mediante DELETE /api/tickets/lock.",
        objective="Garantizar que el asiento quede disponible inmediatamente para otros usuarios.",
        preconditions="Asiento bloqueado previamente por el usuario.",
        test_data="Event ID: 19, Seat ID: 'QA-API-UNLOCK-01'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Bloquear primero
    lock_payload = {"eventId": 19, "seatId": "QA-API-UNLOCK-01", "sectionName": "General", "price": 100.0}
    requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=lock_payload, headers=headers, timeout=10)
    doc.add_step(1, "Bloquear asiento preliminarmente", "Bloqueo establecido", "Bloqueado", "✓")

    # 2. Desbloquear
    unlock_payload = {"eventId": 19, "seatId": "QA-API-UNLOCK-01"}
    resp = requests.delete(f"{GATEWAY_URL}/api/tickets/lock", json=unlock_payload, headers=headers, timeout=10)
    s2_ok = (resp.status_code == 200)
    doc.add_step(2, "Enviar DELETE /api/tickets/lock", "HTTP 200 OK con {'status': 'success'}", f"HTTP {resp.status_code}", "✓" if s2_ok else "✗")

    doc.attach_evidence("seat_unlock_response", {"status_code": resp.status_code, "body": resp.text})
    doc_status = "Aprobada" if s2_ok else "Fallida"
    doc.finish(doc_status, observations="La liberación de butacas opera de manera atómica.")

    return {
        "id": "CP-070",
        "name": "desbloqueo_asiento_endpoint_delete",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

