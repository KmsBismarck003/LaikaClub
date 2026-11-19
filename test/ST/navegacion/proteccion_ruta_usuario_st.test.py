"""
Prueba de Sistema (ST) - Navegación: Protección de Rutas y Endpoints de Usuario
CP-024: Comprueba que las operaciones del rol usuario exijan autenticación obligatoria.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-024",
        name="proteccion_ruta_usuario_st",
        module="Sistema / Guardia de Seguridad",
        level="ST",
        test_type="Seguridad / Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el bloqueo de acceso a endpoints protegidos de la cartera, perfil y reembolsos cuando la petición no incluye cabecera de autenticación.",
        objective="Verificar que el sistema rechace con código HTTP 401 (Unauthorized) las solicitudes no autenticadas.",
        preconditions="Servicios activos en Docker.",
        test_data="Endpoints protegidos sin token: /api/auth/users/me, /api/tickets/my-tickets, /api/tickets/refund/my-refunds"
    )
    doc.start()

    protected_endpoints = [
        ("GET", f"{GATEWAY_URL}/api/auth/users/me", "Perfil de usuario"),
        ("GET", f"{GATEWAY_URL}/api/tickets/my-tickets", "Cartera de boletos"),
        ("GET", f"{GATEWAY_URL}/api/tickets/refund/my-refunds", "Rastreador de reembolsos")
    ]

    all_passed = True
    for idx, (method, url, label) in enumerate(protected_endpoints, start=1):
        resp = requests.request(method, url, timeout=10)
        s_ok = (resp.status_code in [401, 403])
        if not s_ok:
            all_passed = False
        doc.add_step(
            idx,
            f"Solicitar {label} ({url}) sin token",
            "HTTP 401 Unauthorized o 403 Forbidden",
            f"HTTP {resp.status_code}",
            "✓" if s_ok else "✗"
        )

    doc.attach_evidence("unauthenticated_attempts", [{"url": u[1], "label": u[2]} for u in protected_endpoints])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Las guardias de seguridad impiden el acceso anónimo a recursos privados.")

    return {
        "id": "CP-024",
        "name": "proteccion_ruta_usuario_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

