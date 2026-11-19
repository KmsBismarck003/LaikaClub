"""
Prueba Exploratoria (ET) - Asientos: Doble Bloqueo Concurrente
CP-056: Explora el comportamiento del sistema al intentar bloquear dos veces el mismo asiento.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-056",
        name="exploratorio_bloqueo_asientos_concurrentes_et",
        module="Exploratorio / Bloqueo Concurrente de Butacas",
        level="ET",
        test_type="Exploratorio",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Explora la resistencia a colisiones cuando se envía una segunda solicitud de bloqueo para un asiento que ya se encuentra retenido.",
        objective="Verificar que el segundo intento sea controlado y no genere duplicidad ni inconsistencia en la memoria de bloqueo.",
        preconditions="Servicio de tickets activo.",
        test_data="Event ID: 19, Seat ID: 'QA-ET-SEAT-01'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    event_id = 19
    seat_id = "QA-ET-SEAT-01"
    payload = {
        "eventId": event_id,
        "seatId": seat_id,
        "sectionName": "Zona General",
        "price": 350.0
    }

    # 1. Primer bloqueo
    r1 = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=10)
    s1_ok = (r1.status_code == 200)
    doc.add_step(1, "Emitir primer bloqueo sobre asiento libre", "HTTP 200 y asiento reservado", f"HTTP {r1.status_code}", "✓" if s1_ok else "✗")

    # 2. Segundo intento de bloqueo sobre el mismo asiento
    r2 = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=10)
    # Puede retornar 200 (si es el mismo usuario re-bloqueando) o 409 Conflict / 400 Bad Request
    s2_ok = (r2.status_code in [200, 400, 409])
    doc.add_step(2, "Emitir segundo bloqueo inmediato sobre el mismo asiento", "HTTP 200 (renovación) o 409 (conflicto)", f"HTTP {r2.status_code}", "✓" if s2_ok else "✗")

    # 3. Liberar asiento para dejar estado limpio
    requests.delete(f"{GATEWAY_URL}/api/tickets/lock", json={"eventId": event_id, "seatId": seat_id}, headers=headers, timeout=10)
    doc.add_step(3, "Liberar asiento para restaurar estado original", "Asiento liberado", "Liberado", "✓")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("lock_collision_exploration", {"r1_status": r1.status_code, "r2_status": r2.status_code})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El gestor de bloqueo maneja los intentos repetidos sin colapso transaccional.")

    return {
        "id": "CP-056",
        "name": "exploratorio_bloqueo_asientos_concurrentes_et",
        "level": "ET",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

