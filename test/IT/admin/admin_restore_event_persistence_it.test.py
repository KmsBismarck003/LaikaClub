import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-008", "admin_restore_event_persistence_it", "IT / Admin",
                             level="IT", test_type="Persistencia Repositorio", technique="Caja gris")
    doc.set_metadata("Comprobar estructura y persistencia en tabla restore_events",
                     "Verificar acceso y esquema de la tabla de auditoría de restauraciones",
                     "Tabla laika_admin.restore_events", "Schema validation")
    doc.start()
    cols = execute_query("laika_admin", "DESCRIBE restore_events;")
    col_names = [c["Field"] for c in cols]
    has_critical_cols = "environment" in col_names and "severity" in col_names
    doc.add_step(1, "Verificar columnas de restore_events", "environment y severity presentes", f"Columnas: {len(col_names)}", "✓" if has_critical_cols else "✗")
    doc.attach_evidence("restore_events_schema", col_names)
    doc.finish("Aprobada" if has_critical_cols else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
