import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

COLOR_MAP = {
    "VALID_ACCESS": "#22C55E",      # Verde esmeralda
    "ALREADY_REDEEMED": "#EF4444",  # Rojo alerta
    "INVALID_CODE": "#DC2626",      # Rojo oscuro
    "FUTURE_EVENT": "#F59E0B"       # Ámbar advertencia
}

def get_badge_color(status_code):
    return COLOR_MAP.get(status_code, "#64748B")

def run_test():
    doc = TestCaseDocumenter("CP-OPE-005", "operador_badge_color_mapper_ut", "UT / Operador",
                             level="UT", test_type="Lógica / UI Semántica", technique="Caja blanca")
    doc.set_metadata("Validar mapeo de colores semánticos de la terminal de acceso",
                     "Garantizar contraste semántico para rápida lectura del operador",
                     "Códigos de validación", "VALID_ACCESS -> #22C55E")
    doc.start()
    c1 = get_badge_color("VALID_ACCESS")
    ok1 = c1 == "#22C55E"
    doc.add_step(1, "Color para acceso válido", "#22C55E (Verde)", c1, "✓" if ok1 else "✗")

    c2 = get_badge_color("ALREADY_REDEEMED")
    ok2 = c2 == "#EF4444"
    doc.add_step(2, "Color para boleto ya usado", "#EF4444 (Rojo)", c2, "✓" if ok2 else "✗")

    c3 = get_badge_color("FUTURE_EVENT")
    ok3 = c3 == "#F59E0B"
    doc.add_step(3, "Color para evento futuro", "#F59E0B (Ámbar)", c3, "✓" if ok3 else "✗")

    success = ok1 and ok2 and ok3
    doc.attach_evidence("color_mapping", {"valid": c1, "already_redeemed": c2, "future": c3})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
