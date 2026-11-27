import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-024", "gestor_merchandise_catalog_uat", "UAT / Gestor",
                             level="UAT", test_type="Aceptación / Mercancía", technique="Caja negra")
    doc.set_metadata("Comprobar catálogo y configuración de mercancía del gestor",
                     "Verificar consulta de productos y parámetros de venta",
                     "Gestor ID 3", "GET /api/merchandise?manager_id=3 y /api/merchandise/settings/3")
    doc.start()
    headers = get_gestor_auth_headers()
    r_items = requests.get(f"{GATEWAY_URL}/api/merchandise?manager_id=3", headers=headers, timeout=10)
    items_ok = r_items.status_code == 200 and isinstance(r_items.json(), list)
    doc.add_step(1, "Listar productos de mercancía", "HTTP 200 y array", f"HTTP {r_items.status_code}, total={len(r_items.json()) if items_ok else 'N/A'}", "✓" if items_ok else "✗")

    r_set = requests.get(f"{GATEWAY_URL}/api/merchandise/settings/3", headers=headers, timeout=10)
    set_ok = r_set.status_code == 200 and "commissionPercentage" in r_set.json()
    doc.add_step(2, "Consultar configuración de gestor", "HTTP 200 con commissionPercentage", f"HTTP {r_set.status_code}", "✓" if set_ok else "✗")

    success = items_ok and set_ok
    doc.attach_evidence("merchandise_uat", {"items_ok": items_ok, "settings_ok": set_ok})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
