import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-011", "gateway_admin_database_tables_sit", "SIT / Admin",
                             level="SIT", test_type="Integración de Sistema", technique="Caja negra")
    doc.set_metadata("Comprobar integración Gateway -> Admin Service para /api/database/tables",
                     "Garantizar que el gateway despacha la consulta hacia el microservicio admin",
                     "Admin autenticado", "GET /api/database/tables")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/tables"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/tables a través de Gateway", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_tables = "tables" in data and isinstance(data["tables"], list) and len(data["tables"]) > 0
    doc.add_step(2, "Verificar lista de tablas", "tables list no vacía", f"Tablas: {len(data.get('tables', []))}", "✓" if has_tables else "✗")

    doc.attach_evidence("tables_response", {"status": resp.status_code, "count": len(data.get("tables", []))})
    success = status_ok and has_tables
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
