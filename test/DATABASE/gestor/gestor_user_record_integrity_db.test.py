import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-076", "gestor_user_record_integrity_db", "DATABASE / Gestor",
                             level="DATABASE", test_type="Integridad / Base de datos", technique="Caja blanca")
    doc.set_metadata("Comprobar registro de usuario del gestor en laika_auth.users",
                     "Validar que el gestor oficial id=3 cuente con email gestor@laikaclub.com y role='gestor'",
                     "Base de datos laika_auth", "SELECT id, email, role, status FROM users WHERE id = 3")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_auth")
    cur = conn.cursor()
    cur.execute("SELECT id, email, role, status, permissions FROM users WHERE id = 3")
    row = cur.fetchone()
    valid_record = row is not None and row[1] == "gestor@laikaclub.com" and row[2] == "gestor" and row[3] == "active"
    doc.add_step(1, "Validar integridad de cuenta del gestor", "id=3, gestor@laikaclub.com, role='gestor', status='active'", f"Encontrado: {row[:4] if row else 'Ninguno'}", "✓" if valid_record else "✗")
    conn.close()

    doc.attach_evidence("db_gestor_user", {"user_record": row[:4] if row else None, "valid": valid_record})
    doc.finish("Aprobada" if valid_record else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
