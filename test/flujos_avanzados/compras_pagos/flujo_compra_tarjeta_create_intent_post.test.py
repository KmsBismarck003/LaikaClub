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
    doc = TestCaseDocumenter("CP-ADV-001", "flujo_compra_tarjeta_create_intent_post", "Pagos / Checkout",
                             level="API", test_type="Funcional / Pasarela", technique="Caja negra")
    doc.set_metadata("Validar creación de intención de pago con tarjeta en laika_tickets con generación de payment_id",
                     "Comprobar registro de transacción de pago pendiente antes de confirmación",
                     "Servicio laika_tickets activo; usuario autenticado", "Monto: 450.0, Evento: 100001")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"amount": 450.0, "eventId": 100001}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/payments/create-intent", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        doc.add_step(1, "Enviar POST create-intent", "HTTP 200 OK con payment_id", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "payment_id" in data, "Falta payment_id"
        assert data.get("status") == "pending", f"Estado inesperado: {data.get('status')}"
        doc.attach_evidence("payment_intent", data)
        doc.finish("Aprobada", observations=f"Payment Intent creado: ID={data['payment_id']}, status={data['status']}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
