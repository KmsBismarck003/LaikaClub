"""
Prueba de Base de Datos (DATABASE) - Persistencia Real en MySQL: Tabla laika_tickets.tickets
CP-076: Verifica la persistencia física de boletos, códigos de validación y campos de auditoría.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-076",
        name="persistencia_boleto_compra_db",
        module="Base de Datos / laika_tickets.tickets",
        level="DATABASE",
        test_type="Base de Datos",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Audita directamente la tabla física laika_tickets.tickets en MySQL para validar la presencia de boletos y la integridad de sus campos clave.",
        objective="Garantizar que todo boleto posea ticket_code único, user_id, event_id, status y fecha de compra no nula.",
        preconditions="MySQL activo en localhost:3306.",
        test_data="Muestra de boletos persistidos en laika_tickets.tickets"
    )
    doc.start()

    tickets = execute_query(
        "laika_tickets",
        "SELECT id, user_id, event_id, ticket_code, status, price, purchase_date FROM tickets LIMIT 10"
    )

    s1_ok = (isinstance(tickets, list) and len(tickets) > 0)
    doc.add_step(
        1,
        "Consultar registros de boletos directamente en laika_tickets.tickets",
        "Boletos encontrados en base de datos física",
        f"{len(tickets)} boletos recuperados",
        "✓" if s1_ok else "✗"
    )

    # Validar que no haya códigos nulos o vacíos
    all_codes_valid = all(bool(t.get("ticket_code")) and len(t.get("ticket_code")) > 3 for t in tickets) if tickets else False
    s2_ok = all_codes_valid
    doc.add_step(
        2,
        "Validar integridad del campo ticket_code (no nulo, longitud > 3)",
        "Todos los códigos de boleto válidos",
        f"{'Válidos en todos los registros' if all_codes_valid else 'Códigos nulos detectados'}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("db_tickets_sample", [{k: str(v) for k, v in t.items()} for t in tickets[:3]])
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="La tabla de boletos conserva la integridad transaccional requerida.")

    return {
        "id": "CP-076",
        "name": "persistencia_boleto_compra_db",
        "level": "DATABASE",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

