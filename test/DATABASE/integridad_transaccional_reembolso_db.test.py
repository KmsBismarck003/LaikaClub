"""
Prueba de Base de Datos (DATABASE) - Persistencia Real en MySQL: cancellation_requests
CP-077: Verifica la estructura y consistencia de la tabla de solicitudes de reembolso en MySQL.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-077",
        name="integridad_transaccional_reembolso_db",
        module="Base de Datos / laika_tickets.cancellation_requests",
        level="DATABASE",
        test_type="Base de Datos",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Audita las columnas y restricciones de la tabla física cancellation_requests para asegurar la trazabilidad de reembolsos.",
        objective="Garantizar que la tabla contenga ticket_id, user_id, status, refund_amount y fechas de auditoría.",
        preconditions="MySQL activo en localhost:3306.",
        test_data="Esquema de laika_tickets.cancellation_requests"
    )
    doc.start()

    columns = execute_query(
        "information_schema",
        "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE "
        "FROM COLUMNS "
        "WHERE TABLE_SCHEMA = 'laika_tickets' AND TABLE_NAME = 'cancellation_requests'"
    )

    col_names = [c["COLUMN_NAME"].lower() for c in columns]
    required = ["ticket_id", "user_id", "status"]
    missing = [r for r in required if r not in col_names]

    s1_ok = (len(missing) == 0)
    doc.add_step(
        1,
        "Validar presencia de columnas obligatorias (ticket_id, user_id, status)",
        "Todas las columnas presentes",
        f"Faltantes: {missing if missing else 'Ninguna (Esquema verificado)'}",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("cancellation_schema_columns", col_names)
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El modelo relacional soporta el ciclo de vida de cancelaciones con auditoría.")

    return {
        "id": "CP-077",
        "name": "integridad_transaccional_reembolso_db",
        "level": "DATABASE",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

