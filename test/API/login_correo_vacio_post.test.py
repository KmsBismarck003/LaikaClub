"""
Prueba de API (API) - Autenticación: POST /api/auth/login con Email Vacío
CP-060: Comprueba la validación de campos obligatorios en el login.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-060",
        name="login_correo_vacio_post",
        module="API / Autenticación",
        level="API",
        test_type="Validación / Negativo",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el rechazo de peticiones de login que envían el correo vacío o nulo.",
        objective="Garantizar que el servicio valide la presencia obligatoria del correo retornando HTTP 400 o 422.",
        preconditions="Servicio de autenticación en línea.",
        test_data="email: '', password: 'SomePassword123!'"
    )
    doc.start()

    resp = requests.post(f"{GATEWAY_URL}/api/auth/login", json={"email": "", "password": "SomePassword123!"}, timeout=10)
    s1_ok = (resp.status_code in [400, 422])
    doc.add_step(1, "Enviar POST /api/auth/login con email vacío", "HTTP 400 Bad Request o 422 Unprocessable Entity", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    doc.attach_evidence("empty_email_response", {"status_code": resp.status_code, "text": resp.text[:200]})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El servicio rechaza la solicitud antes de intentar verificar el hash.")

    return {
        "id": "CP-060",
        "name": "login_correo_vacio_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

