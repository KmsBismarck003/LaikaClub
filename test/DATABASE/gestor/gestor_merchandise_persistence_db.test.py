import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-075", "gestor_merchandise_persistence_db", "DATABASE / Gestor",
                             level="DATABASE", test_type="Persistencia / Base de datos", technique="Caja blanca")
    doc.set_metadata("Comprobar persistencia de productos en laika_merchandise.merchandise_items",
                     "Validar vinculación entre producto y manager_id = 3",
                     "Base de datos laika_merchandise", "SELECT id, name, manager_id FROM merchandise_items")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_merchandise")
    cur = conn.cursor()
    cur.execute("SELECT id, name, manager_id, status, admin_status FROM merchandise_items WHERE manager_id = 3")
    rows = cur.fetchall()
    has_rows = len(rows) > 0
    doc.add_step(1, "Verificar persistencia de artículos del gestor 3", "Productos vinculados a manager_id=3", f"Total: {len(rows)}", "✓" if has_rows else "✗")
    conn.close()

    doc.attach_evidence("db_merch_items", {"count": len(rows), "samples": rows})
    doc.finish("Aprobada" if has_rows else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
