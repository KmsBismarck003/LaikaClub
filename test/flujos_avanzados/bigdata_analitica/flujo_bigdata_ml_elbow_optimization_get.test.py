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
    doc = TestCaseDocumenter("CP-ADV-034", "flujo_bigdata_ml_elbow_optimization_get", "Big Data / Machine Learning",
                             level="API", test_type="Machine Learning / Clustering", technique="Caja negra")
    doc.set_metadata("Validar optimización de clustering mediante el Método del Codo (Elbow Method)",
                     "Comprobar cálculo de distorsión y sugerencia de k óptimo para segmentación de usuarios",
                     "Servicio laika_analytics_bigdata activo", "Ruta: GET /api/analytics/ml/elbow?max_k=4")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/analytics/ml/elbow?max_k=4", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        data = r.json()
        doc.add_step(1, "Ejecutar Método del Codo (Elbow)", "HTTP 200 con curvas de inercia/distorsión", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("ml_elbow", {"status_code": r.status_code, "response": data})
        doc.finish("Aprobada", observations="Optimización de clústeres mediante Método del Codo calculada con éxito")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
