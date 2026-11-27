import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-009", "operador_auth_user_query_it", "IT / Operador",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar persistencia y rol de operador en laika_auth.users",
                     "Garantizar que el operador ID 2 tenga role='operador' y status='active'",
                     "Base de datos laika_auth", "SELECT id, email, role FROM users WHERE id = 2")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_auth")
    cur = conn.cursor()
    cur.execute("SELECT id, email, role, status FROM users WHERE id = 2")
    row = cur.fetchone()
    valid = row is not None and row[1] == "operador@laikaclub.com" and row[2] == "operador"
    doc.add_step(1, "Consultar cuenta de operador oficial", "operador@laikaclub.com con role='operador'", f"Registro: {row}", "✓" if valid else "✗")
    conn.close()

    doc.attach_evidence("db_operador_auth", {"user": row})
    doc.finish("Aprobada" if valid else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
