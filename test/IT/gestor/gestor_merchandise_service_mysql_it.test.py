import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-008", "gestor_merchandise_service_mysql_it", "IT / Gestor",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar integración MerchandiseService <-> laika_merchandise.merchandise_items",
                     "Validar consulta de productos oficiales registrados por el gestor",
                     "Base de datos laika_merchandise", "SELECT count(*) FROM merchandise_items WHERE manager_id = 3")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_merchandise")
    cur = conn.cursor()
    cur.execute("SELECT id, name, category, status FROM merchandise_items WHERE manager_id = 3")
    items = cur.fetchall()
    has_items = len(items) > 0
    doc.add_step(1, "Consultar mercancía de gestor 3 en MySQL", "Al menos 1 producto", f"Total encontrados: {len(items)}", "✓" if has_items else "✗")
    conn.close()

    doc.attach_evidence("db_merch", {"count": len(items), "items": items})
    doc.finish("Aprobada" if has_items else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
