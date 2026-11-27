import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def validate_admin_permissions(perm_dict):
    required = ["canViewDashboard", "canCreateEvents", "canEditEvents", "canManageUsers"]
    missing = [p for p in required if not perm_dict.get(p, False)]
    return len(missing) == 0, missing

def run_test():
    doc = TestCaseDocumenter("CP-ADM-001", "admin_permissions_validator_ut", "UT / Admin",
                             level="UT", test_type="Lógica / Permisos", technique="Caja blanca")
    doc.set_metadata("Validar función de evaluación de matriz de permisos de administrador",
                     "Garantizar que se verifiquen todos los permisos críticos",
                     "Definición de permisos requeridos", "{canViewDashboard: True, ...}")
    doc.start()
    valid_perms = {"canViewDashboard": True, "canCreateEvents": True, "canEditEvents": True, "canManageUsers": True}
    is_valid, missing = validate_admin_permissions(valid_perms)
    doc.add_step(1, "Validar permisos completos", "is_valid == True", f"is_valid={is_valid}", "✓" if is_valid else "✗")

    invalid_perms = {"canViewDashboard": True}
    is_valid_inv, missing_inv = validate_admin_permissions(invalid_perms)
    doc.add_step(2, "Validar permisos incompletos", "is_valid == False", f"is_valid={is_valid_inv}, missing={missing_inv}", "✓" if not is_valid_inv else "✗")

    success = is_valid and (not is_valid_inv) and ("canManageUsers" in missing_inv)
    doc.attach_evidence("validation_output", {"valid": is_valid, "invalid_missing": missing_inv})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
