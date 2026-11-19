import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-087", "admin_persistencia_restore_event_db", "DATABASE / Admin",
                             level="DATABASE", test_type="Integridad Transaccional", technique="Caja gris")
    doc.set_metadata("Comprobar integridad transaccional e inserción directa en la tabla restore_events",
                     "Garantizar que las columnas de severidad y ambiente cumplan con las restricciones de MySQL",
                     "MySQL 8.0 tabla laika_admin.restore_events", "INSERT e integridad")
    doc.start()
    # Inserción de prueba
    query = "INSERT INTO restore_events (environment, severity, restore_type, restore_reason, created_at, is_confirmed) VALUES ('qa', 'critical', 'full', 'Prueba QA Automation', NOW(), 1);"
    execute_query("laika_admin", query)
    doc.add_step(1, "Insertar evento de restauración de prueba en MySQL", "Inserción exitosa", "OK", "✓")

    rows = execute_query("laika_admin", "SELECT id, environment, severity, restore_reason FROM restore_events WHERE restore_reason = 'Prueba QA Automation' ORDER BY id DESC LIMIT 1;")
    inserted = len(rows) == 1
    doc.add_step(2, "Verificar persistencia del registro", "Fila recuperada", f"Fila: {rows}", "✓" if inserted else "✗")

    # Limpieza
    if inserted:
        execute_query("laika_admin", "DELETE FROM restore_events WHERE id = %s;", (rows[0]["id"],))

    doc.attach_evidence("db_restore_event", {"inserted": inserted, "row": rows[0] if rows else {}})
    doc.finish("Aprobada" if inserted else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
