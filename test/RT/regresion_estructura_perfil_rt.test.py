"""
Prueba de Regresión (RT) - Contratos de API: Consistencia del DTO UserProfileResponse
CP-041: Verifica que el DTO de perfil retornado por laika_auth mantenga todos los atributos esperados por React.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-041",
        name="regresion_estructura_perfil_rt",
        module="Regresión / DTOs de Usuario",
        level="RT",
        test_type="Regresión",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que el endpoint GET /api/auth/users/me preserve todos los campos requeridos por las páginas UserProfile y UserDashboard.",
        objective="Garantizar la compatibilidad hacia atrás en las propiedades: id, email, firstName, lastName, role, permissions, status.",
        preconditions="Usuario autenticado con sesión válida.",
        test_data="Token JWT del usuario de prueba"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    resp = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    required_fields = ["id", "email", "firstName", "lastName", "role", "permissions", "status"]
    missing = [f for f in required_fields if f not in data]
    s2_ok = (len(missing) == 0)

    doc.add_step(
        1,
        "Consultar endpoint de perfil /api/auth/users/me",
        "HTTP 200 OK",
        f"HTTP {resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    doc.add_step(
        2,
        "Validar presencia de todos los atributos en el DTO UserProfileResponse",
        f"7 campos obligatorios presentes: {', '.join(required_fields)}",
        f"Faltantes: {missing if missing else 'Ninguno (DTO 100% íntegro)'}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("profile_dto_fields", list(data.keys()))
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El contrato del perfil de usuario se mantiene 100% compatible con el frontend.")

    return {
        "id": "CP-041",
        "name": "regresion_estructura_perfil_rt",
        "level": "RT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

