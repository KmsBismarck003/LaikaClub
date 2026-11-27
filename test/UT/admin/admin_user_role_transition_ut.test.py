import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

ALLOWED_ROLES = {"usuario", "gestor", "admin", "operador"}

def can_transition_role(current_role, target_role, requester_role):
    if requester_role != "admin":
        return False, "Solo un administrador puede alterar roles"
    if target_role not in ALLOWED_ROLES:
        return False, f"Rol objetivo no reconocido: {target_role}"
    if current_role == target_role:
        return False, "El usuario ya posee ese rol"
    return True, "Transición permitida"

def run_test():
    doc = TestCaseDocumenter("CP-ADM-005", "admin_user_role_transition_ut", "UT / Admin",
                             level="UT", test_type="Lógica / Transiciones", technique="Caja blanca")
    doc.set_metadata("Validar máquina de estados de cambio de roles",
                     "Garantizar que solo admin pueda ascender o degradar roles válidos",
                     "Roles: usuario, gestor, admin, operador", "Requester role check")
    doc.start()
    t1, m1 = can_transition_role("usuario", "gestor", requester_role="admin")
    doc.add_step(1, "Admin promueve usuario a gestor", "True", f"{t1} ({m1})", "✓" if t1 else "✗")

    t2, m2 = can_transition_role("usuario", "gestor", requester_role="gestor")
    doc.add_step(2, "Gestor intenta promover usuario", "False", f"{t2} ({m2})", "✓" if not t2 else "✗")

    t3, m3 = can_transition_role("usuario", "super_god", requester_role="admin")
    doc.add_step(3, "Admin asigna rol inexistente", "False", f"{t3} ({m3})", "✓" if not t3 else "✗")

    success = t1 and (not t2) and (not t3)
    doc.attach_evidence("transition_results", {"admin_promo": t1, "unauthorized": t2, "invalid_role": t3})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
