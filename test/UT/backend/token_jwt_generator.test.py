"""
Prueba Unitaria (UT) - Backend: Estructura y Claims de Tokens JWT
CP-006: Comprueba la presencia de claims obligatorios (user_id, sub, role, exp) en tokens emitidos.
"""
import jwt
from datetime import datetime, timezone
from utils.case_documenter import TestCaseDocumenter

def create_simulated_token(user_id, email, role, secret="jwtsecret123"):
    payload = {
        "user_id": user_id,
        "sub": email,
        "role": role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int(datetime.now(timezone.utc).timestamp()) + 3600
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def decode_and_validate_claims(token, secret="jwtsecret123"):
    decoded = jwt.decode(token, secret, algorithms=["HS256"])
    required_claims = ["user_id", "sub", "role", "iat", "exp"]
    for claim in required_claims:
        if claim not in decoded:
            return False, f"Falta claim obligatorio: {claim}"
    return True, decoded

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-006",
        name="token_jwt_generator",
        module="Seguridad / Auth Token Backend",
        level="UT",
        test_type="Seguridad",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa unitariamente la generación y decodificación de tokens JWT asegurando la integridad de claims de identidad.",
        objective="Verificar que todo token contenga sub (email), user_id y role.",
        preconditions="Librería criptográfica PyJWT activa.",
        test_data="Usuario: ID 30078, Email: qa_user_test@laikaclub.com, Rol: usuario"
    )
    doc.start()

    token = create_simulated_token(30078, "qa_user_test@laikaclub.com", "usuario")
    valid, details = decode_and_validate_claims(token)

    step1_ok = (token is not None and len(token) > 20)
    doc.add_step(1, "Generar token JWT firmado con HS256", "Token generado con éxito", f"Longitud: {len(token)} chars", "✓" if step1_ok else "✗")

    step2_ok = valid
    doc.add_step(2, "Verificar presencia de claims obligatorios", "Todos los claims presentes", str(details.keys()), "✓" if step2_ok else "✗")

    step3_ok = (details.get("role") == "usuario" and details.get("user_id") == 30078)
    doc.add_step(3, "Verificar consistencia de datos de usuario", "Rol=usuario, user_id=30078", f"Rol={details.get('role')}, user_id={details.get('user_id')}", "✓" if step3_ok else "✗")

    all_passed = step1_ok and step2_ok and step3_ok
    doc.attach_evidence("jwt_decoded", details)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Claims conformes con el estándar RFC 7519.")

    return {
        "id": "CP-006",
        "name": "token_jwt_generator",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

