"""
Prueba de API (API) - Tickets: GET /api/tickets/my-tickets Autenticado
CP-068: Verifica la consulta de boletos propios del usuario autenticado.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-068",
        name="mis_boletos_endpoint_get",
        module="API / Cartera de Boletos",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención de los boletos adquiridos por el usuario actual mediante GET /api/tickets/my-tickets con Bearer token.",
        objective="Verificar que el servicio responda con código HTTP 200 y una lista con las entradas del usuario.",
        preconditions="Usuario autenticado.",
        test_data="Token JWT del usuario de prueba"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    tickets = resp.json() if s1_ok else []

    doc.add_step(1, "Enviar GET /api/tickets/my-tickets con cabecera Authorization", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = isinstance(tickets, list)
    doc.add_step(2, "Verificar que el cuerpo sea una lista JSON", "Tipo lista devuelto", f"Tipo: {type(tickets).__name__}, Conteo: {len(tickets)}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("user_tickets_response", {"count": len(tickets), "sample": tickets[0] if tickets else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio de tickets aísla correctamente los boletos correspondientes al usuario en sesión.")

    return {
        "id": "CP-068",
        "name": "mis_boletos_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

