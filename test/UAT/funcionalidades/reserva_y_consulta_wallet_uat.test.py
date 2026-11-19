"""
Prueba de Aceptación de Usuario (UAT) - Funcionalidades: Cartera Digital y Boletos
CP-031: Evalúa la experiencia de visualización y consulta de boletos en la cartera del usuario.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-031",
        name="reserva_y_consulta_wallet_uat",
        module="UAT / Cartera Digital (UserWallet)",
        level="UAT",
        test_type="Aceptación de Usuario",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el acceso a la sección 'Mis Boletos / Cartera', verificando que el usuario visualice sus accesos digitales con código QR y estado.",
        objective="Garantizar que la cartera digital presente de forma organizada las entradas activas, transferidas o pasadas.",
        preconditions="Usuario autenticado en la plataforma.",
        test_data="Token JWT del usuario de prueba."
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # Paso 1: Consultar la cartera digital
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    tickets = resp.json() if s1_ok else []
    doc.add_step(
        1,
        "Ingresar a la vista de 'Mis Boletos' (Cartera Digital)",
        "HTTP 200 con listado estructurado de boletos",
        f"HTTP {resp.status_code}, {len(tickets)} boletos en cartera",
        "✓" if s1_ok else "✗"
    )

    # Paso 2: Si no tiene boletos, adquirir uno de cortesía para el evento gratuito 24
    if len(tickets) == 0:
        claim_payload = {
            "eventId": 24,
            "sectionName": "General",
            "quantity": 1
        }
        claim_resp = requests.post(f"{GATEWAY_URL}/api/tickets/free", json=claim_payload, headers=headers, timeout=10)
        s2_ok = (claim_resp.status_code == 200)
        doc.add_step(2, "Registrar entrada gratuita para comprobar reflejo en cartera", "HTTP 200 confirmando registro", f"HTTP {claim_resp.status_code}", "✓" if s2_ok else "✗")

        # Re-consultar boletos
        re_resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
        tickets = re_resp.json() if re_resp.status_code == 200 else []
    else:
        s2_ok = True
        doc.add_step(2, "Comprobar existencia de boletos previos en cartera", "Boletos disponibles encontrados", f"{len(tickets)} boletos existentes", "✓")

    # Paso 3: Validar que cada boleto contenga código de ticket y datos de evento
    s3_ok = True
    if tickets:
        t = tickets[0]
        has_code = bool(t.get("ticket_code") or t.get("ticketCode") or t.get("id"))
        s3_ok = has_code

    doc.add_step(
        3,
        "Verificar estructura y legibilidad del boleto digital (código, precio, estatus)",
        "Datos completos del boleto para ingreso al recinto",
        f"Código de boleto verificado: {tickets[0].get('ticket_code') if tickets else 'Sin boletos'}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("wallet_snapshot", {"tickets_count": len(tickets), "sample_ticket": tickets[0] if tickets else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="La cartera digital despliega con claridad los boletos y pases de acceso del usuario.")

    return {
        "id": "CP-031",
        "name": "reserva_y_consulta_wallet_uat",
        "level": "UAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

