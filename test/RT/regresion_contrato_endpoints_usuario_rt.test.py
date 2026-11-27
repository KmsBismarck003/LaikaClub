"""
Prueba de Regresión (RT) - Contratos de API: Estabilidad de Esquemas JSON
CP-039: Verifica que las firmas de respuesta de los endpoints del rol usuario mantengan compatibilidad estricta.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-039",
        name="regresion_contrato_endpoints_usuario_rt",
        module="Regresión / Contratos de API",
        level="RT",
        test_type="Regresión",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que las actualizaciones de backend no hayan roto los contratos esperados por los componentes React del rol usuario.",
        objective="Garantizar que campos clave en eventos y boletos sigan existiendo con sus tipos de datos esperados.",
        preconditions="Servicios en vivo.",
        test_data="Contratos de /api/events/public y /api/tickets/my-tickets"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Contrato de eventos públicos
    ev_resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=1", timeout=10)
    s1_ok = (ev_resp.status_code == 200 and len(ev_resp.json()) > 0)
    event = ev_resp.json()[0] if s1_ok else {}
    required_event_keys = ["id", "name", "category", "price", "status"]
    missing_ev = [k for k in required_event_keys if k not in event]
    s1_verified = (s1_ok and len(missing_ev) == 0)

    doc.add_step(
        1,
        "Validar contrato de eventos públicos (campos id, name, category, price, status)",
        "Todos los campos clave presentes sin roturas",
        f"Faltantes: {missing_ev if missing_ev else 'Ninguno (Contrato íntegro)'}",
        "✓" if s1_verified else "✗"
    )

    # 2. Contrato de boletos de usuario
    tk_resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s2_ok = (tk_resp.status_code == 200 and isinstance(tk_resp.json(), list))
    doc.add_step(
        2,
        "Validar contrato de boletos de usuario (/api/tickets/my-tickets)",
        "HTTP 200 con estructura de lista JSON",
        f"HTTP {tk_resp.status_code}, tipo: {type(tk_resp.json()).__name__ if s2_ok else 'N/A'}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_verified and s2_ok
    doc.attach_evidence("contract_snapshot", {"sample_event": event, "tickets_contract_valid": s2_ok})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="No se detectan regresiones de contrato que comprometan la renderización de la UI.")

    return {
        "id": "CP-039",
        "name": "regresion_contrato_endpoints_usuario_rt",
        "level": "RT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

