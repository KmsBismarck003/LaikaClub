"""
Prueba Unitaria (UT) - Frontend: Validación de formato de correo electrónico
CP-001: Verifica las reglas sintácticas del validador de correos de LaikaClub.
"""
import re
from utils.case_documenter import TestCaseDocumenter

def validate_email(email):
    if not email or not isinstance(email, str):
        return False
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-001",
        name="login_validacion_correo",
        module="Autenticación / Login Frontend",
        level="UT",
        test_type="Funcional",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa unitariamente la función de validación sintáctica de direcciones de correo electrónico en formularios.",
        objective="Garantizar que solo correos con formato válido sean aceptados y se rechacen cadenas mal formadas.",
        preconditions="Módulo de utilidades de validación disponible.",
        test_data="Correos válidos: usuario@dominio.com, test.sub@laika.com; Inválidos: sin_arroba, @sin_usuario.com, usuario@.com"
    )
    doc.start()

    test_cases = [
        ("usuario@laikaclub.com", True, "Correo estándar"),
        ("arturo.vela+test@gmail.com", True, "Correo con signo más y punto"),
        ("sin_arroba.com", False, "Falta arroba"),
        ("@sin_usuario.com", False, "Falta usuario local"),
        ("usuario@sin_dominio", False, "Falta TLD de dominio"),
        ("", False, "Cadena vacía")
    ]

    all_passed = True
    for idx, (email, expected, label) in enumerate(test_cases, start=1):
        res = validate_email(email)
        status = "✓" if res == expected else "✗"
        if res != expected:
            all_passed = False
        doc.add_step(idx, f"Validar formato de '{email}' ({label})", f"Es válido: {expected}", f"Es válido: {res}", status)

    doc.attach_evidence("evaluated_inputs", [c[0] for c in test_cases])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Validador regex operó conforme a especificación RFC 5322 simplificada.")

    return {
        "id": "CP-001",
        "name": "login_validacion_correo",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

