import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-052", "staff_dashboard_stats_endpoint_get", "API / Operador",
                             level="API", test_type="Funcional / Dashboard", technique="Caja negra")
    doc.set_metadata("Validar que GET /api/stats/staff/dashboard devuelva métricas operativas del tablero de control.",
                     "Comprobar disponibilidad de indicadores de aforo y lecturas para staff",
                     "Servicio laika_stats activo; token de operador", "N/A")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/stats/staff/dashboard", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Consultar GET /api/stats/staff/dashboard", "HTTP 200 OK", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert "totalScanned" in data, "Falta clave 'totalScanned'"
        assert "validScans" in data, "Falta clave 'validScans'"
        assert "scansPerHour" in data, "Falta clave 'scansPerHour'"
        
        doc.attach_evidence("staff_stats_response", data)
        doc.finish("Aprobada", observations=f"200 OK verificado: totalScanned={data['totalScanned']}, validScans={data['validScans']}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
