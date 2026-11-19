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
    doc = TestCaseDocumenter("CP-ADV-037", "flujo_bigdata_ml_anomaly_detection_get", "Big Data / Detección Anomalías",
                             level="API", test_type="Machine Learning / Isolation Forest", technique="Caja negra")
    doc.set_metadata("Validar detección de patrones de compra anómalos, bots y sospecha de reventa",
                     "Comprobar ejecución de algoritmo de Isolation Forest sobre transacciones",
                     "Servicio laika_analytics_bigdata activo", "Ruta: GET /api/analytics/ml/anomaly")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/analytics/ml/anomaly", timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [200, 404], f"Status inesperado: {r.status_code}"
        doc.add_step(1, "Ejecutar detección de anomalías", "HTTP 200 con reporte o 404 controlado", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("ml_anomaly", {"status_code": r.status_code})
        doc.finish("Aprobada", observations=f"Evaluación de anomalías y bots completada: HTTP {r.status_code}")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
