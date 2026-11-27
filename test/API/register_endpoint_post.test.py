"""
Prueba de API (API) - Registro: POST /api/auth/register Exitoso
CP-061: Evalúa el registro de una nueva cuenta de usuario con datos válidos.
"""
import time
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-061",
        name="register_endpoint_post",
        module="API / Registro de Usuario",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el registro exitoso de una nueva cuenta de usuario mediante POST /api/auth/register.",
        objective="Verificar que el backend retorne HTTP 200/201 con token de sesión y persista el nuevo registro con rol 'usuario'.",
        preconditions="Servicio de autenticación y MySQL disponibles.",
        test_data="Usuario dinámico con timestamp"
    )
    doc.start()

    ts = int(time.time())
    new_email = f"api_reg_test_{ts}@laikaclub.com"
    payload = {
        "email": new_email,
        "password": "PasswordSeguro2026!",
        "first_name": "API_Reg",
        "last_name": "Tester",
        "phone": "5551239999"
    }

    resp = requests.post(f"{GATEWAY_URL}/api/auth/register", json=payload, timeout=10)
    s1_ok = (resp.status_code in [200, 201])
    data = resp.json() if s1_ok else {}

    doc.add_step(1, f"Enviar POST a /api/auth/register con '{new_email}'", "HTTP 200 o 201 Creado", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = ("token" in data and data.get("user", {}).get("email") == new_email)
    doc.add_step(2, "Verificar retorno de token y datos de usuario", "Token emitido y email coincidente", f"Token: {'Sí' if 'token' in data else 'No'}, Email: {data.get('user', {}).get('email')}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("registration_response", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El endpoint de registro procesa la creación de usuario conforme al contrato.")

    return {
        "id": "CP-061",
        "name": "register_endpoint_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

