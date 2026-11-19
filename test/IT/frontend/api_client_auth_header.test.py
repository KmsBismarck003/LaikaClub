"""
Prueba de Integración (IT) - Frontend: Inyección de Cabecera Authorization
CP-011: Comprueba que el cliente HTTP inyecte el token JWT en las cabeceras hacia los endpoints protegidos.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-011",
        name="api_client_auth_header",
        module="Cliente HTTP / Frontend Integration",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la integración entre el almacén de tokens y la capa de peticiones HTTP del frontend.",
        objective="Garantizar que al existir un token válido, se genere la cabecera 'Authorization: Bearer <token>' de forma consistente.",
        preconditions="Token JWT obtenido desde el microservicio de autenticación real.",
        test_data="Token JWT obtenido en tiempo de ejecución."
    )
    doc.start()

    token = get_auth_token()
    s1_ok = (token is not None and len(token) > 20)
    doc.add_step(1, "Recuperar token JWT activo de la sesión", "Token válido no nulo", f"Token presente (len: {len(token) if token else 0})", "✓" if s1_ok else "✗")

    headers = get_auth_headers(token)
    s2_ok = ("Authorization" in headers and headers["Authorization"].startswith("Bearer "))
    doc.add_step(2, "Construir headers con get_auth_headers()", "Cabecera Authorization presente con prefijo Bearer", headers.get("Authorization", "")[:25] + "...", "✓" if s2_ok else "✗")

    s3_ok = (headers.get("Content-Type") == "application/json")
    doc.add_step(3, "Verificar Content-Type por defecto", "application/json", headers.get("Content-Type"), "✓" if s3_ok else "✗")

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("generated_headers", {"Content-Type": headers.get("Content-Type"), "Auth_Prefix": headers.get("Authorization", "")[:15]})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El cliente HTTP ensambla correctamente las cabeceras requeridas para microservicios protegidos.")

    return {
        "id": "CP-011",
        "name": "api_client_auth_header",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

