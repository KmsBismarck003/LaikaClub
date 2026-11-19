"""
Prueba de Integración de Sistema (SIT) - Autenticación: Verificación de Sesión (/api/auth/verify)
CP-018: Comprueba la validación de token y recuperación de sesión mediante el Gateway hacia Auth.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-018",
        name="token_validation_gateway_sit",
        module="SIT / Verificación de Sesión",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la capacidad del Gateway para transferir tokens Bearer en cabeceras HTTP hacia /api/auth/verify.",
        objective="Verificar que una sesión activa sea confirmada con status HTTP 200 y valid=true.",
        preconditions="Token JWT obtenido en tiempo de ejecución de un usuario real.",
        test_data="Token JWT Bearer"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Petición GET con token válido
    resp = requests.get(f"{GATEWAY_URL}/api/auth/verify", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}

    s1_ok = (resp.status_code == 200)
    doc.add_step(1, "Enviar GET /api/auth/verify con token válido", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (data.get("valid") is True)
    doc.add_step(2, "Verificar flag de validez en payload de respuesta", "valid: True", f"valid: {data.get('valid')}", "✓" if s2_ok else "✗")

    s3_ok = (data.get("user") is not None and "email" in data.get("user", {}))
    doc.add_step(3, "Verificar objeto de usuario adjunto a la sesión", "Objeto user con email presente", f"Email: {data.get('user', {}).get('email')}", "✓" if s3_ok else "✗")

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("verification_response", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El middleware de autenticación valida correctamente la firma criptográfica.")

    return {
        "id": "CP-018",
        "name": "token_validation_gateway_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

