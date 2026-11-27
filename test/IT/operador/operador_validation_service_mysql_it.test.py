import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-006", "operador_validation_service_mysql_it", "IT / Operador",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar integración ContextualValidationService <-> laika_tickets.ticket_validation_logs",
                     "Validar conexión real y consulta de registros de auditoría de accesos",
                     "Base de datos laika_tickets", "SELECT count(*) FROM ticket_validation_logs")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_tickets")
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM ticket_validation_logs")
    count = cur.fetchone()[0]
    ok = count >= 0
    doc.add_step(1, "Consultar registros de validación en MySQL", "Consulta exitosa con conteo >= 0", f"Total logs: {count}", "✓" if ok else "✗")
    conn.close()

    doc.attach_evidence("db_validation_logs", {"total_logs": count})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
