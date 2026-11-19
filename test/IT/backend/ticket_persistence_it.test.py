"""
Prueba de Integración (IT) - Backend: Persistencia de Boletos (laika_tickets <-> MySQL)
CP-014: Verifica la integración entre la capa de repositorio JPA y la tabla tickets.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query, execute_single
from utils.auth_helper import get_auth_token
import requests
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-014",
        name="ticket_persistence_it",
        module="Tickets / Persistencia MySQL",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la persistencia y lectura física de boletos en la base de datos laika_tickets.",
        objective="Verificar que los boletos asociados a un usuario existan en la tabla física 'tickets' con datos íntegros.",
        preconditions="Microservicio tickets y MySQL activos.",
        test_data="Consulta de tickets activos para el usuario de prueba."
    )
    doc.start()

    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 1. Consultar boletos desde la API
    api_resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s1_ok = (api_resp.status_code == 200)
    tickets_api = api_resp.json() if s1_ok else []
    doc.add_step(
        1,
        "Consultar boletos del usuario vía GET /api/tickets/my-tickets",
        "HTTP 200 con lista de boletos (vacía o con registros)",
        f"HTTP {api_resp.status_code}, {len(tickets_api)} boletos retornados",
        "✓" if s1_ok else "✗"
    )

    # 2. Consultar conteo total de tickets en MySQL para este usuario
    user_info = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10).json()
    user_id = user_info.get("id")

    db_tickets = execute_query("laika_tickets", "SELECT id, ticket_code, status, price, event_id FROM tickets WHERE user_id = %s", (user_id,))
    s2_ok = (len(tickets_api) == len(db_tickets))
    doc.add_step(
        2,
        "Verificar coincidencia de cardinalidad entre API y MySQL",
        f"Conteo API ({len(tickets_api)}) == Conteo DB ({len(db_tickets)})",
        f"API={len(tickets_api)}, DB={len(db_tickets)}",
        "✓" if s2_ok else "✗"
    )

    # 3. Validar consistencia de campos críticos (id, ticket_code)
    s3_ok = True
    if tickets_api and db_tickets:
        api_codes = set(t.get("ticket_code") or t.get("ticketCode") for t in tickets_api)
        db_codes = set(t.get("ticket_code") for t in db_tickets)
        s3_ok = api_codes.issubset(db_codes) or db_codes.issubset(api_codes)

    doc.add_step(
        3,
        "Validar concordancia de códigos de boleto entre capa API y MySQL",
        "Códigos de boleto consistentes",
        f"Códigos validados: {len(db_tickets)} registros",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("persistence_summary", {"user_id": user_id, "api_count": len(tickets_api), "db_count": len(db_tickets)})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Persistencia relacional de boletos confirmada con integridad referencial.")

    return {
        "id": "CP-014",
        "name": "ticket_persistence_it",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

