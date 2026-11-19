import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_event_end_time(start_time, duration_minutes):
    parts = start_time.split(":")
    total = int(parts[0]) * 60 + int(parts[1]) + duration_minutes
    return f"{total // 60:02d}:{total % 60:02d}"

def run_test():
    doc = TestCaseDocumenter("CP-GES-001", "gestor_event_duration_calculator_ut", "UT / Gestor",
                             level="UT", test_type="Lógica / Funciones", technique="Caja blanca")
    doc.set_metadata("Validar cálculo de tiempo de finalización de evento",
                     "Garantizar que la duración en minutos se sume correctamente a la hora inicial",
                     "Hora inicial HH:MM y duración en minutos", "start='14:00', duration=600")
    doc.start()
    res = calculate_event_end_time("14:00", 600)
    success = res == "24:00"
    doc.add_step(1, "Calcular fin para evento de 10 horas", "24:00", res, "✓" if success else "✗")

    res2 = calculate_event_end_time("20:30", 90)
    success2 = res2 == "22:00"
    doc.add_step(2, "Calcular fin para show de 90 min", "22:00", res2, "✓" if success2 else "✗")

    doc.attach_evidence("calculation_results", {"test1": res, "test2": res2})
    doc.finish("Aprobada" if (success and success2) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
