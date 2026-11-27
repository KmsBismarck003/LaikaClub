import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-018", "flujo_mercancia_cambio_estado_admin_put", "Mercancía / Moderación",
                             level="API", test_type="Funcional / Admin", technique="Caja negra")
    doc.set_metadata("Validar moderación administrativa: cambio de estado de publicación de mercancía oficial",
                     "Comprobar facultad de administradores para aprobar productos en tienda",
                     "Servicio laika_merchandise activo; credenciales admin", "Merch ID: 99, admin_status: approved")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        headers["X-User-Role"] = "admin"
        headers["X-User-Id"] = "1"
        payload = {"adminStatus": "approved", "admin_status": "approved"}
        r = requests.put(f"{GATEWAY_URL}/api/merchandise/99/admin_status", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Inesperado: {r.status_code} - {r.text}"
        doc.add_step(1, "Actualizar estado admin de mercancía ID 99", "HTTP 200 con entidad actualizada", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("merch_admin_status", {"status_code": r.status_code, "body": r.json()})
        doc.finish("Aprobada", observations=f"Moderación de mercancía ejecutada exitosamente: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
