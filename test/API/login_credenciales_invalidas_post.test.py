"""
Prueba de API (API) - Autenticación: POST /api/auth/login con Contraseña Inválida
CP-059: Comprueba que el backend responda con código HTTP 401 Unauthorized ante contraseña incorrecta.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, QA_USER_EMAIL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-059",
        name="login_credenciales_invalidas_post",
        module="API / Autenticación",
        level="API",
        test_type="Funcional / Negativo",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el rechazo de la autenticación cuando se proporciona un correo existente pero una contraseña errónea.",
        objective="Verificar que el backend retorne HTTP 401 Unauthorized y no expida ningún token JWT.",
        preconditions="Usuario existente en el sistema.",
        test_data=f"Email: {QA_USER_EMAIL}, Contraseña: 'PasswordTotalmenteIncorrecto!'"
    )
    doc.start()

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_USER_EMAIL, "password": "PasswordTotalmenteIncorrecto!"}
    resp = requests.post(url, json=payload, timeout=10)
    data = resp.json() if resp.status_code != 500 else {}

    s1_ok = (resp.status_code == 401)
    doc.add_step(1, "Enviar POST con contraseña errónea", "HTTP 401 Unauthorized", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = ("token" not in data)
    doc.add_step(2, "Verificar que NO se emita token JWT", "Token ausente en respuesta", f"Token presente: {'Sí (VULNERABLE)' if not s2_ok else 'No (Seguro)'}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("invalid_credentials_evidence", {"status_code": resp.status_code, "body": data})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio rechaza limpiamente credenciales erróneas.")

    return {
        "id": "CP-059",
        "name": "login_credenciales_invalidas_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

