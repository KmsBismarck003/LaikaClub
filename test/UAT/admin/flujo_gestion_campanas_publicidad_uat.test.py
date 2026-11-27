import sys
import requests
import time
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-023", "flujo_gestion_campanas_publicidad_uat", "UAT / Admin",
                             level="UAT", test_type="Aceptación de Usuario", technique="Caja negra")
    doc.set_metadata("Flujo de aceptación de gestión de campañas y anuncios publicitarios",
                     "Crear anuncio, registrar interacción de clic y eliminar el anuncio",
                     "Admin autenticado", "CRUD /api/ads")
    doc.start()
    headers = get_admin_auth_headers()
    title = f"Campaña Promo QA {int(time.time())}"

    # 1. Crear anuncio
    ad_payload = {
        "title": title,
        "imageUrl": "https://laikaclub.com/banner_test.jpg",
        "linkUrl": "https://laikaclub.com/promo",
        "position": "main",
        "active": True
    }
    r_create = requests.post(f"{GATEWAY_URL}/api/ads", json=ad_payload, headers=headers, timeout=10)
    created_ok = r_create.status_code == 200
    ad_id = r_create.json().get("id") if created_ok else None
    doc.add_step(1, "Crear anuncio publicitario", "HTTP 200 y ID asignado", f"HTTP {r_create.status_code}, id={ad_id}", "✓" if created_ok and ad_id else "✗")

    # 2. Registrar clic
    clicked = False
    if ad_id:
        r_click = requests.post(f"{GATEWAY_URL}/api/ads/{ad_id}/click", json={"userId": 1}, headers=headers, timeout=10)
        clicked = r_click.status_code == 200
    doc.add_step(2, "Registrar interacción de clic", "HTTP 200", f"HTTP {r_click.status_code if ad_id else 'N/A'}", "✓" if clicked else "✗")

    # 3. Eliminar anuncio
    deleted = False
    if ad_id:
        r_del = requests.delete(f"{GATEWAY_URL}/api/ads/{ad_id}", headers=headers, timeout=10)
        deleted = r_del.status_code == 200
    doc.add_step(3, "Eliminar anuncio creado", "HTTP 200", f"HTTP {r_del.status_code if ad_id else 'N/A'}", "✓" if deleted else "✗")

    doc.attach_evidence("ad_campaign_lifecycle", {"ad_id": ad_id, "created": created_ok, "clicked": clicked, "deleted": deleted})
    success = created_ok and clicked and deleted
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
