import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-013", "flujo_transferencia_incoming_list_get", "Transferencias / Listado",
                             level="API", test_type="Funcional / Bandeja", technique="Caja negra")
    doc.set_metadata("Validar contrato de respuesta al consultar transferencias entrantes pendientes del usuario",
                     "Comprobar bandeja de boletos transferidos pendientes de aceptación",
                     "Servicio laika_tickets activo; usuario autenticado", "N/A")
    doc.start()
    try:
        headers = get_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/tickets/transfer/incoming", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "El cuerpo devuelto debe ser una lista"
        doc.add_step(1, "Consultar transferencias entrantes", "HTTP 200 OK con array JSON", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("incoming_transfers", {"total": len(data)})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} transferencias entrantes")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
