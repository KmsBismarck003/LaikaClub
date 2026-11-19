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
    doc = TestCaseDocumenter("CP-ADV-039", "flujo_recintos_locations_catalog_get", "Recintos / Geografía",
                             level="API", test_type="Funcional / Catálogos Geográficos", technique="Caja negra")
    doc.set_metadata("Validar consulta de catálogo geográfico oficial (países, estados y municipios)",
                     "Comprobar disponibilidad de ubicaciones para asignación territorial de recintos",
                     "Servicio laika_events activo", "Ruta: GET /api/venues/locations/countries y states/1")
    doc.start()
    try:
        r_c = requests.get(f"{GATEWAY_URL}/api/venues/locations/countries", timeout=TIMEOUT_DEFAULT)
        assert r_c.status_code == 200, f"Error en países: {r_c.status_code}"
        countries = r_c.json()
        assert len(countries) > 0, "Catálogo de países vacío"
        doc.add_step(1, "Consultar catálogo de países", "HTTP 200 con listado", f"HTTP {r_c.status_code} ({len(countries)} países)", "✓")
        
        r_s = requests.get(f"{GATEWAY_URL}/api/venues/locations/states/{countries[0]['id']}", timeout=TIMEOUT_DEFAULT)
        assert r_s.status_code == 200, f"Error en estados: {r_s.status_code}"
        doc.add_step(2, "Consultar estados por país", "HTTP 200 con estados", f"HTTP {r_s.status_code}", "✓")
        doc.attach_evidence("locations", {"countries": len(countries), "sample_state": r_s.json()[:2] if isinstance(r_s.json(), list) else []})
        doc.finish("Aprobada", observations="Catálogos territoriales consultados con éxito")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
