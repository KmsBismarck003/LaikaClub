import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-040", "flujo_recintos_seat_types_catalog_get", "Recintos / Tipos Butaca",
                             level="API", test_type="Funcional / Aforos", technique="Caja negra")
    doc.set_metadata("Validar catálogo de tipos de asiento y butacas configurables en salas",
                     "Comprobar disponibilidad de tipos reservables (VIP, General, Accesibilidad)",
                     "Servicio laika_events activo", "Ruta: GET /api/venues/seat-types")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/venues/seat-types", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        types = r.json()
        assert len(types) > 0, "Catálogo de tipos de asiento vacío"
        doc.add_step(1, "Consultar tipos de asiento", "HTTP 200 con listado", f"HTTP {r.status_code} ({len(types)} tipos)", "✓")
        doc.attach_evidence("seat_types", types)
        doc.finish("Aprobada", observations=f"Tipos de butaca configurables validados: {len(types)} categorías")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
