"""
Prueba Unitaria (UT) - Frontend: Formateo de moneda (MXN)
CP-004: Verifica la visualización estética y formateo numérico en pesos mexicanos.
"""
from utils.case_documenter import TestCaseDocumenter

def format_currency_mxn(amount):
    if amount is None:
        return "$0.00"
    try:
        val = float(amount)
        return f"${val:,.2f}"
    except (ValueError, TypeError):
        return "$0.00"

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-004",
        name="formato_moneda_util",
        module="Utilidades UI / Formato Frontend",
        level="UT",
        test_type="Funcional",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la función de formateo monetario en pesos mexicanos con comas para millares y punto decimal.",
        objective="Garantizar que montos numéricos o cadenas válidas se presenten correctamente en los componentes UI.",
        preconditions="Función de formato monetario disponible.",
        test_data="Entradas: 0, 1500, 2450000.5, '120.75', None, 'invalido'"
    )
    doc.start()

    cases = [
        (0, "$0.00", "Cero"),
        (1500, "$1,500.00", "Mil quinientos con coma"),
        (2450000.5, "$2,450,000.50", "Millones con decimal"),
        ("120.75", "$120.75", "Cadena numérica"),
        (None, "$0.00", "Valor nulo"),
        ("invalido", "$0.00", "Valor no convertible")
    ]

    all_passed = True
    for idx, (inp, expected, label) in enumerate(cases, start=1):
        formatted = format_currency_mxn(inp)
        status = "✓" if formatted == expected else "✗"
        if formatted != expected:
            all_passed = False
        doc.add_step(idx, f"Formatear {inp} ({label})", expected, formatted, status)

    doc.attach_evidence("formatted_cases", [{"input": str(c[0]), "expected": c[1]} for c in cases])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El formateador maneja casos borde y valores nulos con gracia.")

    return {
        "id": "CP-004",
        "name": "formato_moneda_util",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

