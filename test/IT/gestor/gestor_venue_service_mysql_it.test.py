import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-009", "gestor_venue_service_mysql_it", "IT / Gestor",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar integración VenueService <-> laika_events.venues & venue_rooms",
                     "Validar consulta relacional entre recintos y salas",
                     "Base de datos laika_events", "SELECT v.id, r.id FROM venues v JOIN venue_rooms r")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_events")
    cur = conn.cursor()
    cur.execute("SELECT v.id, v.name, count(r.id) FROM venues v LEFT JOIN venue_rooms r ON v.id = r.venue_id GROUP BY v.id, v.name LIMIT 5")
    rows = cur.fetchall()
    has_venues = len(rows) > 0
    doc.add_step(1, "Consulta relacional recintos y salas", "Recintos con salas", f"Total inspeccionados: {len(rows)}", "✓" if has_venues else "✗")
    conn.close()

    doc.attach_evidence("db_venues", {"venues": rows})
    doc.finish("Aprobada" if has_venues else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
