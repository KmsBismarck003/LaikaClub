import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-007", "admin_backup_history_persistence_it", "IT / Admin",
                             level="IT", test_type="Persistencia Repositorio", technique="Caja gris")
    doc.set_metadata("Comprobar persistencia de registros en backup_history",
                     "Verificar lectura de registros históricos de respaldos en la base de datos",
                     "Tabla laika_admin.backup_history", "Campos id, backup_id, status")
    doc.start()
    rows = execute_query("laika_admin", "SELECT id, backup_id, status, type FROM backup_history ORDER BY id DESC LIMIT 5;")
    persisted = len(rows) > 0
    doc.add_step(1, "Consultar backup_history en MySQL", "Registros > 0", f"Obtenidos: {len(rows)}", "✓" if persisted else "✗")
    doc.attach_evidence("backup_history_records", rows)
    doc.finish("Aprobada" if persisted else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
