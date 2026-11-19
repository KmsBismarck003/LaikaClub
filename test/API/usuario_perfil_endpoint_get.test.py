"""
Prueba de API (API) - Perfil: GET /api/auth/users/me
CP-063: Verifica la consulta autorizada de información de cuenta del usuario actual.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL, QA_USER_EMAIL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-063",
        name="usuario_perfil_endpoint_get",
        module="API / Perfil de Usuario",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención del perfil propio del usuario autenticado mediante GET /api/auth/users/me.",
        objective="Verificar que el servicio retorne HTTP 200 con el DTO UserProfileResponse conteniendo los datos de la cuenta activa.",
        preconditions="Token JWT Bearer válido.",
        test_data="Token JWT del usuario de prueba"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    resp = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(1, "Enviar GET /api/auth/users/me con Bearer token", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (data.get("email") == QA_USER_EMAIL and data.get("role") == "usuario")
    doc.add_step(2, "Validar coincidencia de email y rol en el DTO", f"Email={QA_USER_EMAIL}, Rol=usuario", f"Email={data.get('email')}, Rol={data.get('role')}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("profile_get_response", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El endpoint retorna con fidelidad los datos asociados al token de sesión.")

    return {
        "id": "CP-063",
        "name": "usuario_perfil_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

