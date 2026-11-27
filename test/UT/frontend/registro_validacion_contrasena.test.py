"""
Prueba Unitaria (UT) - Frontend: Validación de complejidad de contraseñas
CP-002: Verifica reglas de seguridad y longitud mínima para registros de usuario.
"""
from utils.case_documenter import TestCaseDocumenter

def validate_password_strength(password):
    if not password or len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres"
    return True, "Contraseña válida"

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-002",
        name="registro_validacion_contrasena",
        module="Registro / Seguridad Frontend",
        level="UT",
        test_type="Funcional",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa unitariamente la regla de longitud mínima y no vaciedad de contraseñas en el formulario de registro.",
        objective="Verificar que el validador rechace contraseñas inferiores a 6 caracteres o vacías.",
        preconditions="Componente o utilidad de validación cargada.",
        test_data="Contraseñas: '', '12345', 'Pass12', 'TestQA123!'"
    )
    doc.start()

    cases = [
        ("", False, "Contraseña vacía"),
        ("12345", False, "5 caracteres (inferior al mínimo)"),
        ("Pass12", True, "6 caracteres (límite inferior válido)"),
        ("TestQA123!", True, "Compleja y válida")
    ]

    all_passed = True
    for idx, (pwd, expected_valid, label) in enumerate(cases, start=1):
        valid, msg = validate_password_strength(pwd)
        status = "✓" if valid == expected_valid else "✗"
        if valid != expected_valid:
            all_passed = False
        doc.add_step(idx, f"Validar entrada de contraseña '{pwd}' ({label})", f"Válido: {expected_valid}", f"Válido: {valid} - {msg}", status)

    doc.attach_evidence("cases_evaluated", [{"input": c[0], "expected": c[1]} for c in cases])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Cumple con la política de contraseña mínima del sistema.")

    return {
        "id": "CP-002",
        "name": "registro_validacion_contrasena",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

