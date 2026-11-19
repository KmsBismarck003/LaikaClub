"""
Prueba de API (API) - Registro: POST /api/auth/register con Correo Duplicado
CP-062: Comprueba el rechazo controlado ante intento de registrar un correo ya existente.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, QA_USER_EMAIL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-062",
        name="register_correo_duplicado_post",
        module="API / Registro de Usuario",
        level="API",
        test_type="Validación / Negativo",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el manejo de colisión de unicidad al enviar una solicitud de registro con un correo que ya existe en la base de datos.",
        objective="Garantizar que el sistema rechace el registro duplicado retornando código HTTP 400 o 409 sin error 500.",
        preconditions="Usuario con QA_USER_EMAIL ya registrado.",
        test_data=f"Email duplicado: {QA_USER_EMAIL}"
    )
    doc.start()

    payload = {
        "email": QA_USER_EMAIL,
        "password": "AnyPassword123!",
        "first_name": "Duplicado",
        "last_name": "Test"
    }

    resp = requests.post(f"{GATEWAY_URL}/api/auth/register", json=payload, timeout=10)
    s1_ok = (resp.status_code in [400, 409, 422])
    doc.add_step(
        1,
        f"Intentar registrar usuario con email existente '{QA_USER_EMAIL}'",
        "HTTP 400 Bad Request o 409 Conflict",
        f"HTTP {resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("duplicate_email_response", {"status_code": resp.status_code, "body": resp.text[:200]})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    defect_id = "N/A" if s1_ok else "DEF-001"
    defect_severity = "N/A" if s1_ok else "Alta"
    obs = "El índice UNIQUE en la columna email previene exitosamente registros redundantes." if s1_ok else (
        "El microservicio de autenticación laika_auth retorna HTTP 500 (Internal Server Error) en lugar de HTTP 409 (Conflict) "
        "o HTTP 400 (Bad Request) cuando un usuario intenta registrarse con un correo ya existente. "
        "Esto genera falsas alarmas de fallo interno en sistemas de monitoreo y degrada la experiencia del cliente."
    )
    doc.finish(doc_status, defect_id=defect_id, defect_severity=defect_severity, observations=obs)

    return {
        "id": "CP-062",
        "name": "register_correo_duplicado_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

