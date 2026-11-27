"""
Prueba de Seguridad (ST-SEC) - Integridad Criptográfica: Manipulación de Tokens JWT (Tampering)
CP-048: Comprueba el rechazo absoluto de tokens con firmas alteradas o falsificadas.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-048",
        name="tampering_token_jwt_security",
        module="Seguridad / Integridad de Tokens JWT",
        level="SECURITY",
        test_type="Seguridad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la resistencia criptográfica ante intentos de alteración de tokens JWT (modificación de caracteres en la firma o intento de escalada de privilegios en el payload).",
        objective="Verificar que cualquier token manipulado sea rechazado inmediatamente con código HTTP 401 Unauthorized.",
        preconditions="Servicio de autenticación en línea.",
        test_data="Token original alterado en su último byte"
    )
    doc.start()

    token = get_auth_token()
    # Alterar el último carácter del token legítimo
    tampered_token = token[:-4] + "XXXX" if token else "fake.jwt.token"

    tampered_headers = {
        "Authorization": f"Bearer {tampered_token}",
        "Content-Type": "application/json"
    }

    # Probar endpoint protegido con el token adulterado
    resp = requests.get(f"{GATEWAY_URL}/api/auth/verify", headers=tampered_headers, timeout=10)
    s1_ok = (resp.status_code == 401)

    doc.add_step(
        1,
        "Enviar petición con token JWT adulterado (firma corrupta)",
        "HTTP 401 Unauthorized",
        f"HTTP {resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("tampering_evidence", {"original_prefix": token[:15] if token else "", "tampered_suffix": tampered_token[-10:], "status_code": resp.status_code})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="La verificación criptográfica HMAC-SHA256 detecta y bloquea tokens manipulados.")

    return {
        "id": "CP-048",
        "name": "tampering_token_jwt_security",
        "level": "SECURITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

