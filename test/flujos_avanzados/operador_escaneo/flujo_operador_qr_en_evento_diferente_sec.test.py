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
    doc = TestCaseDocumenter("CP-ADV-026", "flujo_operador_qr_en_evento_diferente_sec", "Operador / Control Puerta",
                             level="SECURITY", test_type="Seguridad / Control de Acceso", technique="Caja negra")
    doc.set_metadata("Validar rechazo de escaneo de boleto asignado a un evento en la puerta de otro evento",
                     "Impedir ingreso de asistentes con boletos de otros espectáculos",
                     "Boleto TKT-C853F390 de Evento 100001 escaneado con selectedEventId=20", "selectedEventId: 20")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"ticketCode": "TKT-C853F390", "gate": "Puerta Principal", "selectedEventId": 20}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/verify", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        # No debe conceder acceso (valid=false)
        assert data.get("valid") is False, "Boleto de otro evento fue aprobado indebidamente"
        doc.add_step(1, "Escanear boleto de evento A en puerta de evento B", "valid: false en respuesta", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("cross_event_scan", data)
        doc.finish("Aprobada", observations=f"Acceso denegado: valid={data.get('valid')}, statusCode={data.get('statusCode')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
