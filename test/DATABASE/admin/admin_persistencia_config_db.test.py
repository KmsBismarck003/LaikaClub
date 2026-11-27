import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-086", "admin_persistencia_config_db", "DATABASE / Admin",
                             level="DATABASE", test_type="Persistencia Relacional", technique="Caja gris")
    doc.set_metadata("Comprobar persistencia física en MySQL de parámetros en system_config",
                     "Garantizar que al actualizar un parámetro vía API se actualice config_value en la base laika_admin",
                     "MySQL 8.0 conexión directa", "Tabla laika_admin.system_config")
    doc.start()
    headers = get_admin_auth_headers()
    key = "db_test_param"
    val = "value_qa_12345"
    requests.post(f"{GATEWAY_URL}/api/config/{key}", json={"value": val}, headers=headers, timeout=10)
    doc.add_step(1, "Actualizar parámetro vía API", "HTTP 200", "Petición enviada", "✓")

    rows = execute_query("laika_admin", "SELECT `key`, `value` FROM system_config WHERE `key` = %s;", (key,))
    persisted = len(rows) == 1 and rows[0]["value"] == val
    doc.add_step(2, "Consultar fila física en MySQL", f"value == '{val}'", f"Encontrado: {rows}", "✓" if persisted else "✗")

    doc.attach_evidence("db_persistence_config", {"key": key, "row": rows[0] if rows else {}})
    doc.finish("Aprobada" if persisted else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
