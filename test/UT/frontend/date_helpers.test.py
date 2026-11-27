"""
Prueba Unitaria (UT) - Frontend: Parseo y Formato de Fechas de Eventos
CP-005: Comprueba la transformación de fechas ISO a formatos legibles para el usuario.
"""
from datetime import datetime
from utils.case_documenter import TestCaseDocumenter

def format_event_date(date_str):
    if not date_str:
        return "Fecha por definir"
    try:
        # Intenta parsear ISO
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
        return f"{dt.day} {meses[dt.month - 1]} {dt.year}"
    except Exception:
        return date_str

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-005",
        name="date_helpers",
        module="Utilidades de Fecha Frontend",
        level="UT",
        test_type="Funcional",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa unitariamente la conversión de cadenas de fecha ISO a formato en español abreviado.",
        objective="Garantizar que las fechas de eventos se muestren claras y amigables al comprador.",
        preconditions="Utilidades de fechas cargadas.",
        test_data="Fechas: '2026-11-20T19:00:00', '2026-12-31', '', 'Texto libre'"
    )
    doc.start()

    cases = [
        ("2026-11-20T19:00:00", "20 nov 2026", "Fecha ISO con hora"),
        ("2026-12-31", "31 dic 2026", "Fecha YYYY-MM-DD"),
        ("", "Fecha por definir", "Fecha vacía"),
        (None, "Fecha por definir", "Fecha nula"),
        ("Proximamente", "Proximamente", "Fallback texto libre")
    ]

    all_passed = True
    for idx, (inp, expected, label) in enumerate(cases, start=1):
        res = format_event_date(inp)
        status = "✓" if res == expected else "✗"
        if res != expected:
            all_passed = False
        doc.add_step(idx, f"Formatear fecha '{inp}' ({label})", expected, res, status)

    doc.attach_evidence("date_cases", [{"input": str(c[0]), "expected": c[1]} for c in cases])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Manejo robusto de fechas y formatos no estándar.")

    return {
        "id": "CP-005",
        "name": "date_helpers",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

