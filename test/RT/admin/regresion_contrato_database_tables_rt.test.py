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
    doc = TestCaseDocumenter("CP-ADM-031", "regresion_contrato_database_tables_rt", "RT / Admin",
                             level="RT", test_type="Regresión / Contratos", technique="Caja negra")
    doc.set_metadata("Validar invariancia de contrato en /api/database/tables",
                     "Garantizar que la respuesta contenga el arreglo 'tables' con objetos de tipo {name, row_count}",
                     "Admin autenticado", "GET /api/database/tables")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/tables"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Solicitar catálogo de tablas", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    has_tables = "tables" in data and isinstance(data["tables"], list)
    item_ok = True
    if has_tables and len(data["tables"]) > 0:
        item_ok = all("name" in t and "row_count" in t for t in data["tables"][:5])
    doc.add_step(2, "Verificar estructura de items", "name y row_count presentes", f"has_tables={has_tables}, item_ok={item_ok}", "✓" if (has_tables and item_ok) else "✗")

    doc.attach_evidence("tables_contract", {"count": len(data.get("tables", [])), "sample": data.get("tables", [])[:3]})
    success = status_ok and has_tables and item_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
