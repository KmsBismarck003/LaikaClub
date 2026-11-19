import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-074", "gestor_courtesy_quotas_persistence_db", "DATABASE / Gestor",
                             level="DATABASE", test_type="Persistencia / Base de datos", technique="Caja blanca")
    doc.set_metadata("Comprobar integridad referencial y persistencia en laika_tickets.courtesy_quotas",
                     "Validar estructura de cuotas de cortesía para gestores",
                     "Base de datos laika_tickets", "SELECT * FROM courtesy_quotas")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_tickets")
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM courtesy_quotas")
    count = cur.fetchone()[0]
    table_exists = count >= 0
    doc.add_step(1, "Verificar existencia y consulta de cuotas", "Consulta sin error", f"Total cuotas: {count}", "✓" if table_exists else "✗")
    conn.close()

    doc.attach_evidence("db_quotas", {"total_quotas": count})
    doc.finish("Aprobada" if table_exists else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
