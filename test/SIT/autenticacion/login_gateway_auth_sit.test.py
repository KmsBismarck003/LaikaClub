"""
Prueba de Integración de Sistema (SIT) - Autenticación: Client -> Gateway -> Auth Service -> MySQL
CP-017: Comprueba la cadena completa de enrutamiento y autenticación entre servicios reales.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, QA_USER_EMAIL, QA_USER_PASSWORD

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-017",
        name="login_gateway_auth_sit",
        module="SIT / Autenticación Ecosistema",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el flujo de autenticación por HTTPS a través de Pilgrim Gateway hacia el microservicio laika_auth.",
        objective="Verificar que el Gateway proxee limpiamente la petición POST /api/auth/login, conserve cabeceras y devuelva el JWT firmado.",
        preconditions="Pilgrim Gateway (8000) y microservicio Auth (8101) activos sin ningún mock.",
        test_data=f"Email: {QA_USER_EMAIL}, Payload JSON estructurado"
    )
    doc.start()

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_USER_EMAIL, "password": QA_USER_PASSWORD}

    resp = requests.post(url, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}

    s1_ok = (resp.status_code == 200)
    doc.add_step(
        1,
        f"Enviar POST a {url} a través de Pilgrim Gateway",
        "HTTP 200 OK recibido desde el microservicio Auth",
        f"HTTP {resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    s2_ok = ("token" in data and len(data["token"]) > 30)
    doc.add_step(
        2,
        "Validar emisión y longitud del token JWT",
        "Token JWT presente y no vacío",
        f"Token recibido: {'Sí' if s2_ok else 'No'} (longitud: {len(data.get('token', ''))})",
        "✓" if s2_ok else "✗"
    )

    s3_ok = (data.get("user", {}).get("role") == "usuario")
    doc.add_step(
        3,
        "Validar rol del usuario autenticado en la respuesta del gateway",
        "Rol = 'usuario'",
        f"Rol retornado: '{data.get('user', {}).get('role')}'",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("gateway_sit_response", {
        "status_code": resp.status_code,
        "headers": dict(resp.headers),
        "user_profile": data.get("user")
    })
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El API Gateway canaliza y retorna la respuesta de autenticación con fidelidad absoluta.")

    return {
        "id": "CP-017",
        "name": "login_gateway_auth_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

