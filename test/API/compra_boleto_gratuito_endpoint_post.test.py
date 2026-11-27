"""
Prueba de API (API) - Tickets: POST /api/tickets/free
CP-071: Evalúa la emisión transaccional de un boleto gratuito para el evento de costo cero.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-071",
        name="compra_boleto_gratuito_endpoint_post",
        module="API / Emisión de Boletos Gratuitos",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la generación directa de boleto mediante POST /api/tickets/free para el evento gratuito oficial (ID 24).",
        objective="Verificar que el backend retorne HTTP 200 con status 'success' y emita los boletos en la respuesta.",
        preconditions="Usuario autenticado y evento de costo cero disponible.",
        test_data="Event ID: 24 (Cine Club: Joyas de la Animación), Section: 'General', Cantidad: 1"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    payload = {
        "eventId": 24,
        "sectionName": "General",
        "quantity": 1
    }

    resp = requests.post(f"{GATEWAY_URL}/api/tickets/free", json=payload, headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(1, "Enviar POST /api/tickets/free con eventId=24", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (data.get("status") == "success" and "tickets" in data)
    doc.add_step(2, "Verificar estado 'success' y emisión de boletos en payload", "status='success' y tickets array", f"Status: {data.get('status')}, Boletos emitidos: {len(data.get('tickets', []))}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("free_ticket_claim_response", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio de tickets genera el boleto con código QR sin requerir pasarela de pago.")

    return {
        "id": "CP-071",
        "name": "compra_boleto_gratuito_endpoint_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

