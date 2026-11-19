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
    doc = TestCaseDocumenter("CP-OPE-054", "tickets_health_endpoint_get", "API / Operador",
                             level="API", test_type="Operativo / Health", technique="Caja negra")
    doc.set_metadata("Validar que GET /api/tickets/health confirme estado UP de la API de validación.",
                     "Comprobar disponibilidad del microservicio crítico de boletaje y control de acceso",
                     "Servicio laika_tickets activo", "N/A")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/tickets/health", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Consultar GET /api/tickets/health", "HTTP 200 OK con status UP", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert data.get("status") in ["alive", "UP"], f"Estado inesperado: {data}"
        
        doc.attach_evidence("tickets_health", data)
        doc.finish("Aprobada", observations=f"200 OK verificado: status={data.get('status')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
