import sys
from datetime import date
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def validate_contract_dates(start_date_str, end_date_str):
    d_start = date.fromisoformat(start_date_str)
    d_end = date.fromisoformat(end_date_str)
    if d_end < d_start:
        return False, "La fecha de fin no puede ser anterior a la de inicio"
    if (d_end - d_start).days < 30:
        return False, "El contrato debe tener una vigencia mínima de 30 días"
    return True, "Válido"

def run_test():
    doc = TestCaseDocumenter("CP-ADM-004", "admin_b2b_contract_date_validator_ut", "UT / Admin",
                             level="UT", test_type="Lógica / Validación", technique="Caja blanca")
    doc.set_metadata("Validar reglas de temporalidad en contratos B2B",
                     "Verificar restricciones de fechas de inicio y fin",
                     "Formato ISO YYYY-MM-DD", "2026-01-01 a 2026-12-31")
    doc.start()
    v1, msg1 = validate_contract_dates("2026-01-01", "2026-12-31")
    doc.add_step(1, "Contrato anual", "True", f"{v1} ({msg1})", "✓" if v1 else "✗")

    v2, msg2 = validate_contract_dates("2026-05-01", "2026-04-01")
    doc.add_step(2, "Fecha fin invertida", "False", f"{v2} ({msg2})", "✓" if not v2 else "✗")

    v3, msg3 = validate_contract_dates("2026-01-01", "2026-01-10")
    doc.add_step(3, "Vigencia menor a 30 días", "False", f"{v3} ({msg3})", "✓" if not v3 else "✗")

    success = v1 and (not v2) and (not v3)
    doc.attach_evidence("date_validations", {"valid_contract": v1, "inverted": v2, "short": v3})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
