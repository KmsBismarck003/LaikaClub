"""
Prueba Unitaria (UT) - Frontend: Cálculo de subtotales y cargos en Carrito
CP-003: Verifica la precisión matemática del carrito al acumular boletos y productos.
"""
from utils.case_documenter import TestCaseDocumenter

def calculate_cart_totals(items, service_fee_rate=0.10, discount_amount=0.0):
    subtotal = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)
    service_fee = round(subtotal * service_fee_rate, 2)
    total_before_discount = subtotal + service_fee
    final_total = max(0.0, round(total_before_discount - discount_amount, 2))
    return {
        "subtotal": round(subtotal, 2),
        "service_fee": service_fee,
        "total": final_total
    }

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-003",
        name="carrito_calculo_subtotal",
        module="Carrito y Checkout Frontend",
        level="UT",
        test_type="Funcional",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Comprueba el cálculo aritmético de subtotal, cargo por servicio (10%) y aplicación de descuento.",
        objective="Garantizar que no existan discrepancias de redondeo ni errores en la acumulación de importes.",
        preconditions="Estructura de items con precio y cantidad válida.",
        test_data="Item A: $500 (cant: 2), Item B: $250 (cant: 1), Cupón: $100"
    )
    doc.start()

    items = [
        {"name": "Boleto VIP", "price": 500.0, "quantity": 2},
        {"name": "Playera Conmemorativa", "price": 250.0, "quantity": 1}
    ]

    res = calculate_cart_totals(items, service_fee_rate=0.10, discount_amount=100.0)

    # Subtotal esperado: (500 * 2) + 250 = 1250.00
    # Service fee: 1250 * 0.10 = 125.00
    # Total: 1250 + 125 - 100 = 1275.00
    expected_subtotal = 1250.0
    expected_fee = 125.0
    expected_total = 1275.0

    step1_ok = (res["subtotal"] == expected_subtotal)
    doc.add_step(1, "Calcular subtotal de items", f"${expected_subtotal:.2f}", f"${res['subtotal']:.2f}", "✓" if step1_ok else "✗")

    step2_ok = (res["service_fee"] == expected_fee)
    doc.add_step(2, "Calcular cargo por servicio del 10%", f"${expected_fee:.2f}", f"${res['service_fee']:.2f}", "✓" if step2_ok else "✗")

    step3_ok = (res["total"] == expected_total)
    doc.add_step(3, "Calcular total neto con descuento de cupón", f"${expected_total:.2f}", f"${res['total']:.2f}", "✓" if step3_ok else "✗")

    all_passed = step1_ok and step2_ok and step3_ok
    doc.attach_evidence("calculation_result", res)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Precisión decimal conforme a estándares financieros.")

    return {
        "id": "CP-003",
        "name": "carrito_calculo_subtotal",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

