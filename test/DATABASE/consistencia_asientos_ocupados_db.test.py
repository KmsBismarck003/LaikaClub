"""
Prueba de Base de Datos (DATABASE) - Consistencia Relacional: Prevención de Sobreventa
CP-078: Verifica que no existan butacas duplicadas activas para un mismo evento en la base de datos física.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-078",
        name="consistencia_asientos_ocupados_db",
        module="Base de Datos / Anti-Sobreventa e Integridad",
        level="DATABASE",
        test_type="Consistencia / Integridad",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Ejecuta una consulta SQL de auditoría de colisiones para detectar si existen asientos duplicados con estado activo para un mismo evento.",
        objective="Garantizar que el sistema no haya permitido ventas solapadas sobre el mismo asiento físico.",
        preconditions="MySQL activo en localhost:3306.",
        test_data="Consulta de agrupamiento (HAVING count(*) > 1) en laika_tickets.tickets"
    )
    doc.start()

    query = """
        SELECT event_id, seat_id, COUNT(*) as duplicates
        FROM tickets
        WHERE seat_id IS NOT NULL 
          AND seat_id != '' 
          AND status = 'active'
        GROUP BY event_id, seat_id
        HAVING COUNT(*) > 1
    """

    duplicates = execute_query("laika_tickets", query)
    s1_ok = (len(duplicates) == 0)

    doc.add_step(
        1,
        "Buscar duplicados de asientos activos agrupados por (event_id, seat_id)",
        "Cero asientos duplicados (0 colisiones)",
        f"{len(duplicates)} colisiones detectadas",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("overbooking_audit", {"duplicates_found": len(duplicates), "items": duplicates})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    defect_id = "N/A" if s1_ok else "DEF-002"
    defect_severity = "N/A" if s1_ok else "Crítica"
    obs = "No existen inconsistencias de sobreventa ni colisiones en asientos asignados." if s1_ok else (
        f"Se detectaron {len(duplicates)} butacas con asignación simultánea duplicada en estado 'active' (sobreventa física/overbooking). "
        "En el evento 20 existen asientos con hasta 33 boletos vendidos simultáneamente al mismo asiento físico, "
        "originado por inyección masiva de compradores sin restricción de unicidad compuesta (event_id, seat_id) en base de datos."
    )
    doc.finish(doc_status, defect_id=defect_id, defect_severity=defect_severity, observations=obs)

    return {
        "id": "CP-078",
        "name": "consistencia_asientos_ocupados_db",
        "level": "DATABASE",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

