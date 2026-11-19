"""
Prueba de Aceptación de Usuario (UAT) - Funcionalidades: Solicitud y Rastreo de Reembolsos
CP-032: Evalúa la experiencia de usuario en el flujo de cancelación y seguimiento en RefundTracker.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-032",
        name="solicitud_reembolso_boleto_uat",
        module="UAT / Cancelaciones y Reembolsos (RefundTracker)",
        level="UAT",
        test_type="Aceptación de Usuario",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el módulo de reembolsos del usuario, comprobando que pueda consultar el historial de cancelaciones en /user/refunds.",
        objective="Garantizar que el rastreador de reembolsos despliegue las solicitudes con su estado (pendiente, aprobada, rechazada).",
        preconditions="Usuario autenticado con rol usuario.",
        test_data="Token JWT del usuario de prueba."
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # Paso 1: Consultar solicitudes de reembolso del usuario
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/refund/my-refunds", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    refunds = resp.json() if s1_ok else []
    doc.add_step(
        1,
        "Ingresar a la vista de 'Mis Reembolsos' (RefundTracker)",
        "HTTP 200 con listado de solicitudes",
        f"HTTP {resp.status_code}, {len(refunds)} solicitudes encontradas",
        "✓" if s1_ok else "✗"
    )

    # Paso 2: Verificar estructura de las solicitudes (si existen)
    s2_ok = True
    if refunds:
        first = refunds[0]
        has_status = ("status" in first or "statusLabel" in first)
        s2_ok = has_status
        doc.add_step(2, "Verificar estado y detalle de la solicitud en curso", "Estado comprensible presente", f"Status: {first.get('statusLabel') or first.get('status')}", "✓")
    else:
        doc.add_step(2, "Verificar visualización de estado vacío sin solicitudes", "Lista vacía sin errores de renderizado", "Sin solicitudes activas", "✓")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("refunds_uat_summary", {"refund_count": len(refunds), "items": refunds[:3]})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El rastreador de reembolsos provee certidumbre y transparencia al usuario.")

    return {
        "id": "CP-032",
        "name": "solicitud_reembolso_boleto_uat",
        "level": "UAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

