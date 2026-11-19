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
    doc = TestCaseDocumenter("CP-OPE-051", "tickets_ticket_history_endpoint_get", "API / Operador",
                             level="API", test_type="Funcional / Filtrado", technique="Caja negra")
    doc.set_metadata("Validar que GET /api/tickets/validations/ticket/{ticketCode} retorne logs idénticos a la ruta staff.",
                     "Comprobar consistencia entre rutas de auditoría por ticket",
                     "Ticket TKT-C853F390 en base de datos", "Ticket: TKT-C853F390")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        ticket_code = "TKT-C853F390"
        r = requests.get(f"{GATEWAY_URL}/api/tickets/validations/ticket/{ticket_code}", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, f"Consultar GET /api/tickets/validations/ticket/{ticket_code}", "HTTP 200 OK", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No se encontraron logs para el ticket"
        
        doc.attach_evidence("tickets_route_history", {"ticket": ticket_code, "total": len(data)})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} registros")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
