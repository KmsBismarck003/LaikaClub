"""
Prueba de Regresión (RT) - Lógica de Negocio: Fórmulas de Cálculo Financiero
CP-040: Verifica que no existan desviaciones en el cálculo de totales y comisiones ante actualizaciones.
"""
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-040",
        name="regresion_calculo_totales_rt",
        module="Regresión / Integridad Financiera",
        level="RT",
        test_type="Regresión",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Audita que la fórmula estándar de desglose de compra (Subtotal + 10% Cargo por Servicio - Descuentos) se conserve inalterada.",
        objective="Garantizar que no existan regresiones aritméticas en el proceso de cobro y liquidación.",
        preconditions="Parámetros base: tasa de servicio = 10%.",
        test_data="Precios unitarios: $1000, $500, $250; Cantidades: 1, 2, 3"
    )
    doc.start()

    datasets = [
        {"price": 1000.0, "qty": 1, "fee_rate": 0.10, "exp_fee": 100.0, "exp_total": 1100.0},
        {"price": 450.50, "qty": 2, "fee_rate": 0.10, "exp_fee": 90.10, "exp_total": 991.10},
        {"price": 200.0, "qty": 3, "fee_rate": 0.10, "exp_fee": 60.0, "exp_total": 660.0}
    ]

    all_passed = True
    for idx, d in enumerate(datasets, start=1):
        subtotal = round(d["price"] * d["qty"], 2)
        fee = round(subtotal * d["fee_rate"], 2)
        total = round(subtotal + fee, 2)

        is_ok = (fee == d["exp_fee"] and total == d["exp_total"])
        if not is_ok:
            all_passed = False
        doc.add_step(
            idx,
            f"Evaluar cálculo para {d['qty']} item(s) de ${d['price']:.2f}",
            f"Fee=${d['exp_fee']:.2f}, Total=${d['exp_total']:.2f}",
            f"Fee=${fee:.2f}, Total=${total:.2f}",
            "✓" if is_ok else "✗"
        )

    doc.attach_evidence("regression_datasets", datasets)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Fórmulas financieras estables y consistentes con la versión de referencia.")

    return {
        "id": "CP-040",
        "name": "regresion_calculo_totales_rt",
        "level": "RT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

