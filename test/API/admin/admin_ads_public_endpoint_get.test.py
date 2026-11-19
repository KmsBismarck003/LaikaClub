import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-070", "admin_ads_public_endpoint_get", "API / Admin",
                             level="API", test_type="Funcional / Publicidad", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint público GET /api/ads/public",
                     "Validar respuesta HTTP 200 con anuncios activos para portales de usuario",
                     "Acceso anónimo", "GET /api/ads/public")
    doc.start()
    url = f"{GATEWAY_URL}/api/ads/public"
    resp = requests.get(url, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "GET /api/ads/public", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else []
    is_list = isinstance(data, list)
    doc.add_step(2, "Verificar lista de anuncios", "Lista JSON devuelta", f"Elementos: {len(data)}", "✓" if is_list else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "count": len(data)})
    success = status_ok and is_list
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
