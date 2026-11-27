import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def calculate_merch_net(gross_price, commission_pct=10.0):
    commission = gross_price * (commission_pct / 100.0)
    net = gross_price - commission
    return round(commission, 2), round(net, 2)

def run_test():
    doc = TestCaseDocumenter("CP-GES-003", "gestor_merchandise_commission_calc_ut", "UT / Gestor",
                             level="UT", test_type="Lógica / Finanzas", technique="Caja blanca")
    doc.set_metadata("Validar deducción de comisión de mercancía oficial",
                     "Comprobar cálculo de comisión del 10% y neto para gestor",
                     "Precio unitario de gorra/playera", "price=299.0, pct=10.0")
    doc.start()
    comm, net = calculate_merch_net(299.0, 10.0)
    step1_ok = comm == 29.9 and net == 269.1
    doc.add_step(1, "Calcular comisión 10% sobre 299.0", "comm=29.9, net=269.1", f"comm={comm}, net={net}", "✓" if step1_ok else "✗")

    comm2, net2 = calculate_merch_net(1000.0, 15.0)
    step2_ok = comm2 == 150.0 and net2 == 850.0
    doc.add_step(2, "Calcular comisión 15% sobre 1000.0", "comm=150.0, net=850.0", f"comm={comm2}, net={net2}", "✓" if step2_ok else "✗")

    doc.attach_evidence("commission_results", {"c1": comm, "n1": net, "c2": comm2, "n2": net2})
    doc.finish("Aprobada" if (step1_ok and step2_ok) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
