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
    doc = TestCaseDocumenter("CP-ADM-075", "admin_ads_delete_endpoint", "API / Admin",
                             level="API", test_type="Funcional / Publicidad", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint DELETE /api/ads/{adId} para eliminación de anuncios",
                     "Validar respuesta HTTP 200 y confirmación de baja",
                     "Admin autenticado", "DELETE /api/ads/{adId}")
    doc.start()
    headers = get_admin_auth_headers()
    # Crear anuncio para borrar
    r_c = requests.post(f"{GATEWAY_URL}/api/ads", json={"title": "To Delete", "imageUrl": "http://img.png", "position": "main", "active": True}, headers=headers, timeout=10)
    ad_id = r_c.json().get("id")

    url = f"{GATEWAY_URL}/api/ads/{ad_id}"
    resp = requests.delete(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "DELETE /api/ads/{adId}", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    doc.attach_evidence("http_response", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if status_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
