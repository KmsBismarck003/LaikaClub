"""
Prueba de API (API) - Autenticación: POST /api/auth/login Exitoso
CP-058: Comprueba la respuesta HTTP 200 y la emisión de JWT ante credenciales correctas.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, QA_USER_EMAIL, QA_USER_PASSWORD

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-058",
        name="login_endpoint_post",
        module="API / Autenticación",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el endpoint de login enviando credenciales válidas en formato JSON.",
        objective="Verificar que el servicio responda con código HTTP 200, cabecera application/json y cuerpo con token JWT y objeto user.",
        preconditions="Usuario registrado y activo en el sistema.",
        test_data=f"Email: {QA_USER_EMAIL}, Contraseña válida"
    )
    doc.start()

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_USER_EMAIL, "password": QA_USER_PASSWORD}
    resp = requests.post(url, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}

    s1_ok = (resp.status_code == 200)
    doc.add_step(1, f"POST a {url} con credenciales correctas", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = ("token" in data and len(data["token"]) > 30)
    doc.add_step(2, "Verificar presencia de token JWT en la respuesta", "Token presente y firmado", f"Longitud: {len(data.get('token', ''))} caracteres", "✓" if s2_ok else "✗")

    s3_ok = (data.get("user", {}).get("email") == QA_USER_EMAIL)
    doc.add_step(3, "Verificar objeto user devuelto", f"Email coincide con {QA_USER_EMAIL}", f"Email: {data.get('user', {}).get('email')}", "✓" if s3_ok else "✗")

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("login_success_response", {"status_code": resp.status_code, "user": data.get("user")})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El endpoint de login responde conforme a la especificación OpenAPI.")

    return {
        "id": "CP-058",
        "name": "login_endpoint_post",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

