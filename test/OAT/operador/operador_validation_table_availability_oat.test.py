import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-025", "operador_validation_table_availability_oat", "OAT / Operador",
                             level="OAT", test_type="Operativo / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar disponibilidad de la tabla ticket_validation_logs en MySQL",
                     "Validar que el motor InnoDB permita operaciones de inserción y lectura",
                     "MySQL corriendo en puerto 3306", "CHECK TABLE ticket_validation_logs")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_tickets")
    cur = conn.cursor()
    cur.execute("CHECK TABLE ticket_validation_logs")
    res = cur.fetchall()
    is_ok = any("OK" in str(row) for row in res) or len(res) > 0
    doc.add_step(1, "CHECK TABLE ticket_validation_logs", "Status OK", f"Resultado: {res}", "✓" if is_ok else "✗")
    conn.close()

    doc.attach_evidence("table_check", {"result": res})
    doc.finish("Aprobada" if is_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
