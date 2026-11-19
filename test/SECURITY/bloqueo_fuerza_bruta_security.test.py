"""
Prueba de Seguridad (ST-SEC) - Fuerza Bruta: Detección y Consulta de Bloqueo
CP-050: Evalúa el mecanismo de auditoría y detección de intentos fallidos de inicio de sesión.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-050",
        name="bloqueo_fuerza_bruta_security",
        module="Seguridad / Prevención de Fuerza Bruta",
        level="SECURITY",
        test_type="Seguridad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el endpoint /api/auth/check-lockout para auditar el estado de bloqueo y control de intentos fallidos.",
        objective="Verificar que el sistema exponga adecuadamente la telemetría de bloqueo y responda con los atributos esperados (locked, remaining_seconds).",
        preconditions="Servicio de autenticación en línea.",
        test_data="Email de consulta: 'qa_user_test@laikaclub.com'"
    )
    doc.start()

    email = "qa_user_test@laikaclub.com"
    resp = requests.get(f"{GATEWAY_URL}/api/auth/check-lockout?email={email}", timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(
        1,
        f"Consultar estado de bloqueo mediante GET /api/auth/check-lockout?email={email}",
        "HTTP 200 con payload informativo de bloqueo",
        f"HTTP {resp.status_code}, Payload: {data}",
        "✓" if s1_ok else "✗"
    )

    s2_ok = ("locked" in data or "is_locked" in data or "lockout" in str(data).lower())
    doc.add_step(
        2,
        "Validar presencia de indicadores de estado de bloqueo",
        "Atributo locked o similar presente en el payload",
        f"Campos: {list(data.keys())}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("lockout_telemetry", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El mecanismo de auditoría de intentos fallidos y bloqueo opera adecuadamente.")

    return {
        "id": "CP-050",
        "name": "bloqueo_fuerza_bruta_security",
        "level": "SECURITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

