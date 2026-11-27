import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-029", "flujo_operador_ticket_transferido_post", "Operador / Trazabilidad",
                             level="API", test_type="Funcional / Auditoría", technique="Caja negra")
    doc.set_metadata("Validar auditoría de boletos transferidos en el punto de control de acceso staff",
                     "Comprobar consulta de historial de auditoría de boletos transferidos",
                     "Servicio laika_tickets activo", "Ticket: TKT-C853F390")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/tickets/validations/ticket/TKT-C853F390", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "El resultado debe ser una lista de logs"
        doc.add_step(1, "Consultar bitácora de auditoría del boleto", "HTTP 200 OK con array de logs", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("ticket_transfer_audit", {"total_logs": len(data)})
        doc.finish("Aprobada", observations=f"Auditoría obtenida: {len(data)} registros de escaneo registrados")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
