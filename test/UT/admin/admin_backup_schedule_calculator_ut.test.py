import sys
from datetime import datetime, timedelta
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_next_backup(frequency, target_time_str, base_datetime):
    t = datetime.strptime(target_time_str, "%H:%M").time()
    next_run = datetime.combine(base_datetime.date(), t)
    if next_run <= base_datetime:
        if frequency == "daily":
            next_run += timedelta(days=1)
        elif frequency == "weekly":
            next_run += timedelta(days=7)
    return next_run

def run_test():
    doc = TestCaseDocumenter("CP-ADM-002", "admin_backup_schedule_calculator_ut", "UT / Admin",
                             level="UT", test_type="Lógica / Algoritmos", technique="Caja blanca")
    doc.set_metadata("Validar cálculo de próximo respaldo automático",
                     "Verificar cálculo de fecha y hora para respaldo diario",
                     "Algoritmo de cálculo temporal", "Frecuencia diaria a las 02:00")
    doc.start()
    base = datetime(2026, 11, 16, 10, 0, 0)
    next_b = calculate_next_backup("daily", "02:00", base)
    expected = datetime(2026, 11, 17, 2, 0, 0)
    matched = (next_b == expected)
    doc.add_step(1, "Calcular próximo respaldo diario", str(expected), str(next_b), "✓" if matched else "✗")

    doc.attach_evidence("calculated_next_backup", {"base": str(base), "next": str(next_b), "matched": matched})
    doc.finish("Aprobada" if matched else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
