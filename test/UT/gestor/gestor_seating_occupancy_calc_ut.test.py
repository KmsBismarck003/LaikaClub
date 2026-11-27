import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_occupancy(total_capacity, sold_seats):
    if total_capacity <= 0:
        return 0.0
    return round((sold_seats / total_capacity) * 100.0, 2)

def run_test():
    doc = TestCaseDocumenter("CP-GES-005", "gestor_seating_occupancy_calc_ut", "UT / Gestor",
                             level="UT", test_type="Lógica / Aforo", technique="Caja blanca")
    doc.set_metadata("Validar cálculo de ocupación porcentual de aforo",
                     "Verificar precisión en porcentaje de asistencia en salas",
                     "Aforo total y boletos vendidos", "cap=50000, sold=4")
    doc.start()
    pct = calculate_occupancy(50000, 4)
    step1_ok = pct == 0.01
    doc.add_step(1, "Ocupación de 4 sobre 50,000", "0.01%", f"{pct}%", "✓" if step1_ok else "✗")

    pct2 = calculate_occupancy(1000, 500)
    step2_ok = pct2 == 50.0
    doc.add_step(2, "Ocupación de 500 sobre 1,000", "50.0%", f"{pct2}%", "✓" if step2_ok else "✗")

    doc.attach_evidence("occupancy_calc", {"pct1": pct, "pct2": pct2})
    doc.finish("Aprobada" if (step1_ok and step2_ok) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
