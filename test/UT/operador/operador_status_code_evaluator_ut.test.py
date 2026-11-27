import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

KNOWN_STATUS_CODES = {
    "VALID_ACCESS": {"actionable": True, "valid": True},
    "ALREADY_REDEEMED": {"actionable": False, "valid": False},
    "INVALID_CODE": {"actionable": False, "valid": False},
    "FUTURE_EVENT": {"actionable": False, "valid": False}
}

def evaluate_validation_status(status_code):
    return KNOWN_STATUS_CODES.get(status_code, {"actionable": False, "valid": False})

def run_test():
    doc = TestCaseDocumenter("CP-OPE-002", "operador_status_code_evaluator_ut", "UT / Operador",
                             level="UT", test_type="Lógica / Estados", technique="Caja blanca")
    doc.set_metadata("Validar evaluación de códigos de estado de acceso para el operador",
                     "Garantizar que solo VALID_ACCESS otorgue acceso accionable",
                     "Códigos de respuesta del validador contextual", "VALID_ACCESS vs ALREADY_REDEEMED")
    doc.start()
    res_valid = evaluate_validation_status("VALID_ACCESS")
    ok1 = res_valid["actionable"] is True and res_valid["valid"] is True
    doc.add_step(1, "Evaluar VALID_ACCESS", "actionable=True, valid=True", str(res_valid), "✓" if ok1 else "✗")

    res_used = evaluate_validation_status("ALREADY_REDEEMED")
    ok2 = res_used["actionable"] is False and res_used["valid"] is False
    doc.add_step(2, "Evaluar ALREADY_REDEEMED", "actionable=False, valid=False", str(res_used), "✓" if ok2 else "✗")

    doc.attach_evidence("status_eval", {"valid": res_valid, "used": res_used})
    doc.finish("Aprobada" if (ok1 and ok2) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
