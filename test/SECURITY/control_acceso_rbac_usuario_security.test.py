"""
Prueba de Seguridad (ST-SEC) - Control de Acceso: Aislamiento de Roles RBAC
CP-049: Verifica que el rol USUARIO no pueda acceder a recursos de Administrador o Gestor.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-049",
        name="control_acceso_rbac_usuario_security",
        module="Seguridad / Control de Acceso Basado en Roles (RBAC)",
        level="SECURITY",
        test_type="Seguridad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el confinamiento de privilegios para el rol 'usuario' intentando acceder a endpoints restringidos de 'admin' y 'gestor'.",
        objective="Garantizar que solicitudes autorizadas como rol 'usuario' sean rechazadas con HTTP 403 Forbidden al intentar invocar rutas administrativas.",
        preconditions="Usuario autenticado con rol usuario legítimo.",
        test_data="Endpoints: /api/admin/users, /api/events/manager/transactions"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    restricted_endpoints = [
        ("GET", f"{GATEWAY_URL}/api/admin/users", "Lista de usuarios del Administrador"),
        ("GET", f"{GATEWAY_URL}/api/events/manager/transactions", "Transacciones financieras del Gestor")
    ]

    all_passed = True
    evidences = []

    for idx, (method, url, label) in enumerate(restricted_endpoints, start=1):
        resp = requests.request(method, url, headers=headers, timeout=10)
        # Debe responder con 403 Forbidden o 401 Unauthorized
        is_blocked = (resp.status_code in [401, 403])
        if not is_blocked:
            all_passed = False
        evidences.append({"url": url, "label": label, "status_code": resp.status_code})
        doc.add_step(
            idx,
            f"Intentar acceso no autorizado a {label} ({url})",
            "HTTP 403 Forbidden o 401 Unauthorized",
            f"HTTP {resp.status_code} ({'Acceso Bloqueado' if is_blocked else 'VULNERABILIDAD - Acceso Permitido'})",
            "✓" if is_blocked else "✗"
        )

    doc.attach_evidence("rbac_violations_attempted", evidences)
    doc_status = "Aprobada" if all_passed else "Fallida"
    defect_id = "N/A" if all_passed else "DEF-003"
    defect_severity = "N/A" if all_passed else "Crítica"
    obs = "El modelo RBAC segmenta estrictamente los recursos según los claims de rol del JWT." if all_passed else (
        "Falla de control de acceso (OWASP Top 10 A01: Broken Access Control). "
        "El endpoint GET /manager/transactions en EventController.java omite validar que el rol del usuario sea 'gestor' o 'admin', "
        "permitiendo a cualquier usuario con rol 'usuario' consultar métricas financieras y transacciones del recinto."
    )
    doc.finish(doc_status, defect_id=defect_id, defect_severity=defect_severity, observations=obs)

    return {
        "id": "CP-049",
        "name": "control_acceso_rbac_usuario_security",
        "level": "SECURITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

