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
    doc = TestCaseDocumenter("CP-ADM-065", "admin_database_export_svg_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Diagrama ER", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/database/export/svg",
                     "Garantizar generación del diagrama entidad-relación en formato SVG vectorial",
                     "Admin autenticado", "GET /api/database/export/svg")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/export/svg"
    resp = requests.get(url, headers=headers, timeout=15)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/database/export/svg", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    has_svg_tag = "<svg" in resp.text
    doc.add_step(2, "Verificar tag vectorial SVG", "<svg presente en el cuerpo", f"has_svg={has_svg_tag}", "✓" if has_svg_tag else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "has_svg": has_svg_tag})
    success = status_ok and has_svg_tag
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
