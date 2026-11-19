import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-006", "gestor_event_service_mysql_it", "IT / Gestor",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar integración EventService <-> laika_events.events",
                     "Validar conexión real y consulta de eventos asignados a gestor",
                     "MySQL corriendo en puerto 3306", "SELECT id, name, created_by FROM events WHERE created_by = 3")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_events")
    cur = conn.cursor()
    cur.execute("SELECT id, name, status, price, created_by FROM events WHERE created_by = 3")
    rows = cur.fetchall()
    has_events = len(rows) > 0
    doc.add_step(1, "Consultar eventos de gestor 3 en MySQL", "Al menos 1 evento", f"Total encontrados: {len(rows)}", "✓" if has_events else "✗")
    conn.close()

    doc.attach_evidence("db_events", {"count": len(rows), "first": rows[0] if rows else None})
    doc.finish("Aprobada" if has_events else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
