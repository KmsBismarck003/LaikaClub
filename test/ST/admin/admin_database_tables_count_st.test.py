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
    doc = TestCaseDocumenter("CP-ADM-019", "admin_database_tables_count_st", "ST / Admin",
                             level="ST", test_type="Funcional / Integridad", technique="Caja negra")
    doc.set_metadata("Comprobar conteo y estructura de tablas del sistema de base de datos",
                     "Garantizar que la consola de base de datos reporte al menos 5 tablas operativas con filas válidas",
                     "Admin autenticado", "GET /api/database/tables")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/tables"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/tables", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    tables = data.get("tables", [])
    has_min_tables = len(tables) >= 5
    has_row_counts = all("row_count" in t and isinstance(t["row_count"], (int, float)) for t in tables)
    doc.add_step(2, "Verificar tablas y conteos", "Tablas >= 5 y conteos válidos", f"Tablas: {len(tables)}, rows_valid={has_row_counts}", "✓" if (has_min_tables and has_row_counts) else "✗")

    doc.attach_evidence("db_tables_summary", {"count": len(tables), "sample": tables[:3]})
    success = status_ok and has_min_tables and has_row_counts
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
