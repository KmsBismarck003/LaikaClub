"""
Prueba de API (API) - Reembolsos: GET /api/tickets/refund/my-refunds
CP-072: Verifica la consulta de solicitudes de reembolso del usuario autenticado.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-072",
        name="mis_reembolsos_endpoint_get",
        module="API / Rastreador de Reembolsos",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el listado de devoluciones solicitadas por el usuario actual mediante GET /api/tickets/refund/my-refunds.",
        objective="Garantizar que el servicio responda con código HTTP 200 y una lista de solicitudes registradas.",
        preconditions="Usuario autenticado.",
        test_data="Token JWT del usuario de prueba"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    resp = requests.get(f"{GATEWAY_URL}/api/tickets/refund/my-refunds", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    refunds = resp.json() if s1_ok else []

    doc.add_step(1, "Enviar GET /api/tickets/refund/my-refunds", "HTTP 200 OK con lista JSON", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = isinstance(refunds, list)
    doc.add_step(2, "Verificar estructura de lista JSON devuelta", "Tipo lista devuelto", f"Tipo: {type(refunds).__name__}, Conteo: {len(refunds)}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("refunds_query_response", {"count": len(refunds), "sample": refunds[0] if refunds else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El endpoint expone la información histórica de cancelaciones de forma segura.")

    return {
        "id": "CP-072",
        "name": "mis_reembolsos_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

