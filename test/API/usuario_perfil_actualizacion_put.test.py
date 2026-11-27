"""
Prueba de API (API) - Perfil: PUT /api/auth/users/me
CP-064: Evalúa la actualización de datos personales (first_name, last_name, phone).
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-064",
        name="usuario_perfil_actualizacion_put",
        module="API / Perfil de Usuario",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la modificación del nombre, apellido y teléfono del usuario autenticado mediante PUT /api/auth/users/me.",
        objective="Verificar que el servicio retorne HTTP 200 con el DTO actualizado reflejando los nuevos valores enviados.",
        preconditions="Token JWT Bearer válido.",
        test_data="Nombres: 'QA_Automated', Apellidos: 'Unit_Check', Tel: '5554443322'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    update_payload = {
        "first_name": "QA_Automated",
        "last_name": "Unit_Check",
        "phone": "5554443322"
    }

    resp = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=update_payload, headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(1, "Enviar PUT /api/auth/users/me con nuevos datos", "HTTP 200 OK con perfil modificado", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (data.get("firstName") == "QA_Automated" and data.get("phone") == "5554443322")
    doc.add_step(2, "Verificar datos modificados en el DTO de respuesta", "firstName='QA_Automated', phone='5554443322'", f"firstName='{data.get('firstName')}', phone='{data.get('phone')}'", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("profile_put_response", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio actualiza los campos permitidos y retorna el objeto sincronizado.")

    return {
        "id": "CP-064",
        "name": "usuario_perfil_actualizacion_put",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

