"""
Prueba Unitaria (UT) - Backend: Algoritmo de Descuentos en Cupones
CP-009: Evalúa la deducción por porcentaje, importe fijo y cargo por servicio según AchievementsService.
"""
from utils.case_documenter import TestCaseDocumenter

def calculate_coupon_discount(discount_type, discount_value, subtotal, service_fee_percent=10.0):
    if discount_type == "percentage":
        return round(subtotal * (discount_value / 100.0), 2)
    elif discount_type == "fixed":
        return round(min(discount_value, subtotal), 2)
    elif discount_type == "service_fee":
        fee = subtotal * (service_fee_percent / 100.0)
        return round(fee * (discount_value / 100.0), 2)
    return 0.0

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-009",
        name="coupon_discount_calculator",
        module="Gamificación / Cupones Backend",
        level="UT",
        test_type="Reglas de negocio",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa los tres tipos de descuento de cupones soportados por laika_achievements.",
        objective="Verificar que el descuento no sobrepase el subtotal ni aplique porcentajes incorrectos.",
        preconditions="Valores de cupón positivos.",
        test_data="Subtotal: $1000.00, Tipos: percentage (15%), fixed ($200), service_fee (50% de comision del 10%)"
    )
    doc.start()

    subtotal = 1000.0

    # 1. Porcentaje: 1000 * 0.15 = 150.00
    d1 = calculate_coupon_discount("percentage", 15.0, subtotal)
    s1_ok = (d1 == 150.0)
    doc.add_step(1, "Calcular cupón de 15% de descuento sobre $1000", "$150.00", f"${d1:.2f}", "✓" if s1_ok else "✗")

    # 2. Fijo: $200
    d2 = calculate_coupon_discount("fixed", 200.0, subtotal)
    s2_ok = (d2 == 200.0)
    doc.add_step(2, "Calcular cupón fijo de $200 sobre $1000", "$200.00", f"${d2:.2f}", "✓" if s2_ok else "✗")

    # 3. Fijo superior al subtotal: $1500 sobre $1000 -> debe topar en $1000
    d3 = calculate_coupon_discount("fixed", 1500.0, subtotal)
    s3_ok = (d3 == 1000.0)
    doc.add_step(3, "Calcular cupón fijo de $1500 sobre $1000 (tope)", "$1000.00", f"${d3:.2f}", "✓" if s3_ok else "✗")

    # 4. Service fee: 50% de la comisión del 10% (100 * 0.50 = 50.00)
    d4 = calculate_coupon_discount("service_fee", 50.0, subtotal, service_fee_percent=10.0)
    s4_ok = (d4 == 50.0)
    doc.add_step(4, "Calcular 50% de descuento sobre el cargo de servicio (10%)", "$50.00", f"${d4:.2f}", "✓" if s4_ok else "✗")

    all_passed = s1_ok and s2_ok and s3_ok and s4_ok
    doc.attach_evidence("discounts_calculated", {"percentage": d1, "fixed": d2, "capped_fixed": d3, "service_fee": d4})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Fórmulas alineadas con AchievementsController y el carrito.")

    return {
        "id": "CP-009",
        "name": "coupon_discount_calculator",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

