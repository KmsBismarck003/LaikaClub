import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-072", "admin_ads_create_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / Publicidad", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/ads para alta de anuncios",
                     "Validar respuesta HTTP 200 y asignación de ID de anuncio",
                     "Admin autenticado", "POST /api/ads")
    doc.start()
    headers = get_admin_auth_headers()
    title = f"Ad QA {int(time.time())}"
    payload = {
        "title": title,
        "imageUrl": "https://laikaclub.com/banner.png",
        "linkUrl": "https://laikaclub.com",
        "position": "main",
        "active": True
    }
    url = f"{GATEWAY_URL}/api/ads"
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "POST /api/ads", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    ad_id = resp.json().get("id") if status_ok else None
    if ad_id:
        requests.delete(f"{GATEWAY_URL}/api/ads/{ad_id}", headers=headers, timeout=5)

    doc.attach_evidence("http_response", {"status": resp.status_code, "ad_id": ad_id})
    success = status_ok and bool(ad_id)
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
