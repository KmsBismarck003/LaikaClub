import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-073", "gestor_events_persistence_db", "DATABASE / Gestor",
                             level="DATABASE", test_type="Persistencia / Base de datos", technique="Caja blanca")
    doc.set_metadata("Comprobar persistencia transaccional en tabla laika_events.events",
                     "Validar que los eventos de gestor cuenten con created_by, status y total_tickets",
                     "Base de datos laika_events", "SELECT id, name, created_by, status FROM events")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_events")
    cur = conn.cursor()
    cur.execute("SELECT id, name, created_by, status, price, total_tickets FROM events WHERE created_by = 3 LIMIT 5")
    rows = cur.fetchall()
    has_rows = len(rows) > 0
    doc.add_step(1, "Consultar registros en laika_events.events", "Al menos 1 registro persistido", f"Total encontrados: {len(rows)}", "✓" if has_rows else "✗")
    conn.close()

    doc.attach_evidence("db_records", {"count": len(rows), "samples": rows})
    doc.finish("Aprobada" if has_rows else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
