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
    doc = TestCaseDocumenter("CP-ADV-036", "flujo_bigdata_ml_prospecting_leads_get", "Big Data / Prospección",
                             level="API", test_type="Inteligencia de Negocio / Leads", technique="Caja negra")
    doc.set_metadata("Validar modelo predictivo de prospección de recintos y plazas de eventos",
                     "Comprobar generación de leads potenciales basados en demanda insatisfecha",
                     "Servicio laika_analytics_bigdata activo", "Ruta: GET /api/analytics/ml/prospecting")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/analytics/ml/prospecting", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        data = r.json()
        doc.add_step(1, "Consultar leads de prospección", "HTTP 200 con ranking de recintos", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("ml_prospecting", {"status_code": r.status_code, "count": len(data) if isinstance(data, list) else 1})
        doc.finish("Aprobada", observations="Modelo de prospección de recintos consultado exitosamente")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
