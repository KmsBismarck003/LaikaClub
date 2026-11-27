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
    doc = TestCaseDocumenter("CP-ADM-064", "admin_database_export_json_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Exportación", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/database/export/json",
                     "Garantizar descarga del esquema relacional en formato JSON",
                     "Admin autenticado", "GET /api/database/export/json")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/export/json"
    resp = requests.get(url, headers=headers, timeout=15)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/export/json", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    is_json = "application/json" in resp.headers.get("Content-Type", "")
    has_content = len(resp.content) > 0
    doc.add_step(2, "Verificar payload exportado", "Content-Type JSON y bytes > 0", f"Bytes: {len(resp.content)}", "✓" if (is_json and has_content) else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "bytes": len(resp.content)})
    success = status_ok and is_json and has_content
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
