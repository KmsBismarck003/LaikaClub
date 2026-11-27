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
    doc = TestCaseDocumenter("CP-OPE-049", "tickets_validations_history_endpoint_get", "API / Operador",
                             level="API", test_type="Funcional / Auditoría", technique="Caja negra")
    doc.set_metadata("Validar que la ruta canónica GET /api/tickets/validations/history entregue la lista de auditoría.",
                     "Comprobar contrato de endpoint de validaciones históricas",
                     "Servicio laika_tickets activo", "N/A")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Consultar GET /api/tickets/validations/history", "HTTP 200 OK", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert isinstance(data, list), "Respuesta debe ser array JSON"
        
        doc.attach_evidence("tickets_history", {"total_logs": len(data)})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} registros")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
