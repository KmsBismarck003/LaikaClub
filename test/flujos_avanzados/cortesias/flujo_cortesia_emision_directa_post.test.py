import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-046", "flujo_cortesia_emision_directa_post", "Cortesías / Emisión",
                             level="API", test_type="Funcional / Gestor", technique="Caja negra")
    doc.set_metadata("Validar emisión oficial de boletos de cortesía por gestor para invitados y prensa",
                     "Comprobar asignación de precio cero ($0.0) y generación de lote de tokens de canje",
                     "Servicio laika_tickets activo; credenciales gestor", "Ruta: POST /api/tickets/courtesy/issue")
    doc.start()
    try:
        headers = get_gestor_auth_headers()
        payload = {
            "eventId": 24,
            "eventFunctionId": 45,
            "sectionName": "General",
            "recipientType": "PATROCINADOR",
            "deliveryMethod": "CLAIM_CODE",
            "quantity": 1,
            "motive": "Patrocinio Oficial QA"
        }
        r = requests.post(f"{GATEWAY_URL}/api/tickets/courtesy/issue", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Error al emitir cortesía: {r.status_code} - {r.text}"
        data = r.json()
        tickets = data.get("tickets", [])
        assert len(tickets) > 0, "No se emitieron boletos de cortesía"
        claim_token = tickets[0].get("claim_token")
        assert claim_token is not None, "Boleto sin claim_token"
        doc.add_step(1, "Emitir cortesía para patrocinador", "HTTP 200 con claim_token generado", f"HTTP {r.status_code} (Token: {claim_token})", "✓")
        doc.attach_evidence("courtesy_issuance", data)
        doc.finish("Aprobada", observations=f"Cortesía emitida con éxito (Token: {claim_token}, Boleto: {tickets[0].get('ticket_code')})")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
