import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

ALLOWED_TRANSITIONS = {
    "draft": ["published", "deleted"],
    "published": ["draft", "cancelled"],
    "cancelled": ["deleted"],
    "deleted": []
}

def can_transition(current_status, target_status):
    return target_status in ALLOWED_TRANSITIONS.get(current_status, [])

def run_test():
    doc = TestCaseDocumenter("CP-GES-004", "gestor_event_status_transition_ut", "UT / Gestor",
                             level="UT", test_type="Lógica / Máquina de estados", technique="Caja blanca")
    doc.set_metadata("Validar máquina de estados de eventos para gestor",
                     "Garantizar transiciones válidas e invalidar saltos ilegales",
                     "Estados: draft, published, cancelled, deleted", "draft -> published vs deleted -> published")
    doc.start()
    ok1 = can_transition("draft", "published")
    doc.add_step(1, "Transición draft -> published", "True", str(ok1), "✓" if ok1 else "✗")

    ok2 = can_transition("published", "draft")
    doc.add_step(2, "Transición published -> draft (unpublish)", "True", str(ok2), "✓" if ok2 else "✗")

    inv1 = can_transition("deleted", "published")
    doc.add_step(3, "Transición ilegal deleted -> published", "False", str(inv1), "✓" if not inv1 else "✗")

    success = ok1 and ok2 and (not inv1)
    doc.attach_evidence("state_machine", {"draft_to_published": ok1, "unpublish": ok2, "deleted_to_published": inv1})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
