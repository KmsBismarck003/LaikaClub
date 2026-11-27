import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_remaining_quota(max_allowed, issued_count):
    if issued_count > max_allowed:
        raise ValueError("Issued count cannot exceed max allowed quota")
    return max_allowed - issued_count

def run_test():
    doc = TestCaseDocumenter("CP-GES-002", "gestor_courtesy_quota_math_ut", "UT / Gestor",
                             level="UT", test_type="Lógica / Cuotas", technique="Caja blanca")
    doc.set_metadata("Validar cálculo de cuota restante de cortesías",
                     "Verificar resta aritmética y control de desbordamiento",
                     "Cuotas asignadas a gestor", "max=50, issued=12")
    doc.start()
    rem = calculate_remaining_quota(50, 12)
    step1_ok = rem == 38
    doc.add_step(1, "Resta normal de cuota", "38", str(rem), "✓" if step1_ok else "✗")

    overflow_ok = False
    try:
        calculate_remaining_quota(10, 15)
    except ValueError:
        overflow_ok = True
    doc.add_step(2, "Excepción por emisión excedida", "ValueError", "Excepción capturada" if overflow_ok else "No capturada", "✓" if overflow_ok else "✗")

    doc.attach_evidence("quota_math", {"remaining": rem, "overflow_handled": overflow_ok})
    doc.finish("Aprobada" if (step1_ok and overflow_ok) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
