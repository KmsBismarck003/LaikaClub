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
    doc = TestCaseDocumenter("CP-ADV-003", "flujo_compra_evento_inexistente_post", "Compras / Límites",
                             level="API", test_type="Integridad / Negativo", technique="Caja negra")
    doc.set_metadata("Validar rechazo controlado al intentar comprar o reservar en un evento inexistente",
                     "Garantizar consistencia ante solicitudes de eventos no registrados",
                     "Servicio laika_tickets activo", "Evento ID: 999999")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"eventId": 999999, "seatCode": "VIP-01"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/free", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Debe ser rechazado (4xx o 503 Service Unavailable por evento no encontrado) y nunca conceder boleto
        rejected = r.status_code in [400, 403, 404, 422, 502, 503]
        doc.add_step(1, "Intentar compra en evento inexistente", "HTTP rechazo (4xx/503)", f"HTTP {r.status_code}", "✓" if rejected else "✗")
        assert rejected, f"Inesperado: {r.status_code} en evento inexistente"
        doc.attach_evidence("compra_evento_inexistente", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Rechazo correcto ante evento inexistente: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
