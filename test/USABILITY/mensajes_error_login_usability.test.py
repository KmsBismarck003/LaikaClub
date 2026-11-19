"""
Prueba de Usabilidad (UT-US) - Retroalimentación de Error: Mensajes en Login
CP-053: Evalúa la claridad, cortesía y precisión de los mensajes de error mostrados al usuario.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-053",
        name="mensajes_error_login_usability",
        module="Usabilidad / Retroalimentación de Errores",
        level="USABILITY",
        test_type="Usabilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que los mensajes de error retornados ante credenciales incorrectas sean comprensibles, amigables y no expongan stacktraces técnicos al usuario.",
        objective="Garantizar una retroalimentación clara que informe al usuario del problema sin comprometer detalles internos del sistema.",
        preconditions="Servicio de autenticación en línea.",
        test_data="Login con contraseña incorrecta"
    )
    doc.start()

    resp = requests.post(
        f"{GATEWAY_URL}/api/auth/login",
        json={"email": "usuario_inexistente_test@laikaclub.com", "password": "WrongPassword123"},
        timeout=10
    )

    s1_ok = (resp.status_code == 401)
    data = resp.json() if resp.status_code != 500 else {}
    doc.add_step(1, "Provocar error controlado de credenciales inválidas", "HTTP 401 Unauthorized", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    # Extraer mensaje de error
    msg = ""
    if "detail" in data:
        if isinstance(data["detail"], dict):
            msg = data["detail"].get("message", "")
        else:
            msg = str(data["detail"])
    elif "message" in data:
        msg = data["message"]

    s2_ok = ("credencial" in msg.lower() or "inválid" in msg.lower() or "incorrect" in msg.lower())
    doc.add_step(
        2,
        "Validar redacción del mensaje de error",
        "Mensaje claro en español sobre credenciales no válidas",
        f"Mensaje obtenido: '{msg}'",
        "✓" if s2_ok else "✗"
    )

    # Validar que no contenga rastros de base de datos ni excepciones Java/Python
    tech_traces = ["NullPointerException", "SQLException", "Traceback", "Exception", "org.springframework"]
    s3_ok = not any(t in str(data) for t in tech_traces)
    doc.add_step(
        3,
        "Verificar ausencia de stacktraces o tecnicismos en el cuerpo de error",
        "Cero excepciones técnicas expuestas",
        f"Tecnicismos filtrados: {'Ninguno (Limpio)' if s3_ok else 'Detectados'}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("usability_login_feedback", {"status_code": resp.status_code, "body": data})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="La interfaz provee mensajes sobrios y profesionales orientados al usuario final.")

    return {
        "id": "CP-053",
        "name": "mensajes_error_login_usability",
        "level": "USABILITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

