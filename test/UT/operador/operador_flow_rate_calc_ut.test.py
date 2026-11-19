import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_entry_rate(total_entries, elapsed_minutes):
    if elapsed_minutes <= 0:
        return 0.0
    return round(total_entries / elapsed_minutes, 2)

def run_test():
    doc = TestCaseDocumenter("CP-OPE-003", "operador_flow_rate_calc_ut", "UT / Operador",
                             level="UT", test_type="Lógica / Aforo", technique="Caja blanca")
    doc.set_metadata("Validar cálculo de flujo de ingreso por minuto en torniquete",
                     "Comprobar división de aforo ingresado entre minutos transcurridos",
                     "Aforo en puerta y tiempo de turno", "entries=600, minutes=30")
    doc.start()
    rate = calculate_entry_rate(600, 30)
    ok1 = rate == 20.0
    doc.add_step(1, "Calcular 600 ingresos en 30 min", "20.0 personas/min", f"{rate} personas/min", "✓" if ok1 else "✗")

    rate2 = calculate_entry_rate(150, 45)
    ok2 = rate2 == 3.33
    doc.add_step(2, "Calcular 150 ingresos en 45 min", "3.33 personas/min", f"{rate2} personas/min", "✓" if ok2 else "✗")

    doc.attach_evidence("rate_results", {"rate1": rate, "rate2": rate2})
    doc.finish("Aprobada" if (ok1 and ok2) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
