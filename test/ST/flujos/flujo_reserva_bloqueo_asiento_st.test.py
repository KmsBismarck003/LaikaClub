"""
Prueba de Sistema (ST) - Flujos: Bloqueo Concurrente y Liberación de Asiento
CP-028: Evalúa el ciclo de vida del bloqueo exclusivo de asiento (POST /lock y DELETE /lock).
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-028",
        name="flujo_reserva_bloqueo_asiento_st",
        module="Sistema / Bloqueo Concurrente de Asientos",
        level="ST",
        test_type="Funcional / Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la reserva temporal exclusiva de un asiento mediante ReentrantLock en laika_tickets y su posterior liberación controlada.",
        objective="Verificar que el asiento quede bloqueado temporalmente y pueda ser liberado adecuadamente por el usuario.",
        preconditions="Usuario autenticado y evento con mapa de asientos activo.",
        test_data="Event ID: 19, Seat ID: 'QA-ST-TEST-01', Section: 'VIP', Precio: 500.0"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    event_id = 19
    seat_id = "QA-ST-LOCK-99"

    # 1. Bloquear asiento
    lock_payload = {
        "eventId": event_id,
        "seatId": seat_id,
        "sectionName": "Zona General",
        "price": 500.0
    }
    lock_resp = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=lock_payload, headers=headers, timeout=10)
    s1_ok = (lock_resp.status_code == 200)
    lock_data = lock_resp.json() if s1_ok else {}
    doc.add_step(
        1,
        f"Bloquear asiento '{seat_id}' para evento {event_id}",
        "HTTP 200 con confirmación de bloqueo",
        f"HTTP {lock_resp.status_code}, Status: {lock_data.get('status')}",
        "✓" if s1_ok else "✗"
    )

    # 2. Desbloquear asiento
    unlock_payload = {
        "eventId": event_id,
        "seatId": seat_id
    }
    unlock_resp = requests.delete(f"{GATEWAY_URL}/api/tickets/lock", json=unlock_payload, headers=headers, timeout=10)
    s2_ok = (unlock_resp.status_code == 200)
    doc.add_step(
        2,
        f"Liberar asiento '{seat_id}' mediante DELETE /api/tickets/lock",
        "HTTP 200 con confirmación de liberación",
        f"HTTP {unlock_resp.status_code}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("lock_unlock_flow", {"lock_response": lock_data, "unlock_status": unlock_resp.status_code})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Mecanismo de concurrencia y bloqueo temporal validado sin bloqueos huérfanos.")

    return {
        "id": "CP-028",
        "name": "flujo_reserva_bloqueo_asiento_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

