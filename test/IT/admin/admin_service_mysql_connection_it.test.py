import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-006", "admin_service_mysql_connection_it", "IT / Admin",
                             level="IT", test_type="Integración Componentes", technique="Caja gris")
    doc.set_metadata("Verificar integración directa con base de datos del microservicio admin",
                     "Comprobar lectura física de la tabla system_config en MySQL",
                     "Conexión a MySQL puerto 3306", "Base laika_admin")
    doc.start()
    rows = execute_query("laika_admin", "SELECT `key`, `value` FROM system_config LIMIT 10;")
    has_rows = len(rows) > 0
    doc.add_step(1, "Consultar system_config en MySQL", "Filas > 0", f"Filas obtenidas: {len(rows)}", "✓" if has_rows else "✗")
    doc.attach_evidence("system_config_sample", rows[:3])
    doc.finish("Aprobada" if has_rows else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
