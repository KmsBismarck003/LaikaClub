import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-027", "disponibilidad_tablas_admin_mysql_oat", "OAT / Admin",
                             level="OAT", test_type="Operacional / Base de Datos", technique="Caja gris")
    doc.set_metadata("Comprobar disponibilidad de todas las tablas relacionales de laika_admin",
                     "Verificar presencia de tablas esenciales: system_config, backup_history, ads, restore_events",
                     "MySQL 8.0 puerto 3306", "Database laika_admin")
    doc.start()
    rows = execute_query("laika_admin", "SHOW TABLES;")
    table_names = [list(r.values())[0] for r in rows]
    required_tables = ["system_config", "backup_history", "ads", "restore_events"]
    missing = [t for t in required_tables if t not in table_names]
    has_all = len(missing) == 0
    doc.add_step(1, "Verificar tablas maestras de admin", "Cero tablas faltantes", f"Faltantes: {missing}, Total: {len(table_names)}", "✓" if has_all else "✗")

    doc.attach_evidence("admin_tables_list", table_names)
    doc.finish("Aprobada" if has_all else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
