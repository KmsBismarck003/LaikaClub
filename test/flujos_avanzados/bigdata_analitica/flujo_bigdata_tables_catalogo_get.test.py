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
    doc = TestCaseDocumenter("CP-ADV-033", "flujo_bigdata_tables_catalogo_get", "Big Data / Catálogo",
                             level="API", test_type="Big Data / Motor Spark", technique="Caja negra")
    doc.set_metadata("Validar consulta de catálogo de tablas disponibles en el motor de analítica Big Data",
                     "Comprobar disponibilidad de tablas distribuidas (tickets, users, payments, events)",
                     "Servicio laika_analytics_bigdata activo", "Ruta: GET /api/analytics/tables")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/analytics/tables", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        data = r.json()
        tables = data.get("tables", [])
        assert len(tables) > 0, "No se retornaron tablas de Big Data"
        doc.add_step(1, "Consultar tablas Big Data", "HTTP 200 con listado de tablas", f"HTTP {r.status_code} ({len(tables)} tablas)", "✓")
        doc.attach_evidence("bigdata_tables", {"status_code": r.status_code, "tables": tables})
        doc.finish("Aprobada", observations=f"Tablas de Big Data disponibles: {tables}")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
