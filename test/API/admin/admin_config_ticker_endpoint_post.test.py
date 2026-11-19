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
    doc = TestCaseDocumenter("CP-ADM-081", "admin_config_ticker_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / Banner Informativo", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/config/ticker para actualización de marquesina",
                     "Validar respuesta HTTP 200 con confirmación de guardado",
                     "Admin autenticado", "POST /api/config/ticker")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/config/ticker"
    payload = {"content": "Venta exclusiva 2026 activa", "enabled": True}
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "POST /api/config/ticker", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
