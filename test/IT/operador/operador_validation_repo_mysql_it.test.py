import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-008", "operador_validation_repo_mysql_it", "IT / Operador",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar esquema relacional de ticket_validation_logs",
                     "Validar columnas críticas para auditoría de torniquete",
                     "Base de datos laika_tickets", "DESCRIBE ticket_validation_logs")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_tickets")
    cur = conn.cursor()
    cur.execute("DESCRIBE ticket_validation_logs")
    cols = [r[0] for r in cur.fetchall()]
    req_cols = ["ticket_code", "result_status", "action_type", "created_at"]
    missing = [c for c in req_cols if c not in cols]
    schema_ok = len(missing) == 0
    doc.add_step(1, "Verificar columnas en tabla de auditoría de accesos", "Columnas requeridas presentes", f"Columnas: {cols}", "✓" if schema_ok else "✗")
    conn.close()

    doc.attach_evidence("validation_schema", {"columns": cols, "missing": missing})
    doc.finish("Aprobada" if schema_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
