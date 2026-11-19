"""
Prueba de Sistema (ST) - Validaciones: Rechazo de Registro con Campos Incompletos
CP-027: Verifica la validación de entrada (Jakarta Validation / Pydantic) en el registro de usuarios.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-027",
        name="registro_usuario_campos_obligatorios_st",
        module="Sistema / Validaciones de Registro",
        level="ST",
        test_type="Validaciones / Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el rechazo de peticiones POST /api/auth/register cuando carecen de campos obligatorios o presentan formato inválido.",
        objective="Garantizar que no se permita el registro de usuarios con email vacío o sin contraseña, retornando código 400 o 422.",
        preconditions="Servicio de autenticación en línea.",
        test_data="Cuerpos con: email ausente, contraseña vacía"
    )
    doc.start()

    invalid_payloads = [
        ({"password": "ValidPassword123!", "first_name": "NoEmail"}, "Sin campo email"),
        ({"email": "notanemail", "password": "ValidPassword123!"}, "Formato de email incorrecto"),
        ({"email": "valid@laika.com", "password": ""}, "Contraseña vacía")
    ]

    all_passed = True
    for idx, (body, label) in enumerate(invalid_payloads, start=1):
        resp = requests.post(f"{GATEWAY_URL}/api/auth/register", json=body, timeout=10)
        s_ok = (resp.status_code in [400, 422])
        if not s_ok:
            all_passed = False
        doc.add_step(
            idx,
            f"Enviar payload inválido: {label}",
            "HTTP 400 Bad Request o 422 Unprocessable Entity",
            f"HTTP {resp.status_code}",
            "✓" if s_ok else "✗"
        )

    doc.attach_evidence("validation_attempts", [{"payload": p[0], "label": p[1]} for p in invalid_payloads])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El backend impone validaciones de integridad antes de persistir nuevos registros.")

    return {
        "id": "CP-027",
        "name": "registro_usuario_campos_obligatorios_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

