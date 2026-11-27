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
    doc = TestCaseDocumenter("CP-ADV-006", "flujo_reembolso_politica_evento_get", "Reembolsos / Políticas",
                             level="API", test_type="Funcional / Contrato", technique="Caja negra")
    doc.set_metadata("Validar consulta de políticas de reembolso aplicables a un evento activo",
                     "Comprobar transparencia de condiciones de cancelación para el consumidor",
                     "Servicio laika_tickets activo", "Evento ID: 100001")
    doc.start()
    try:
        headers = get_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/tickets/refunds/policy/100001", headers=headers, timeout=TIMEOUT_DEFAULT)
        doc.add_step(1, "Consultar política de reembolso", "HTTP 200 OK con eligible y refundPercentage", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "eligible" in data, "Falta clave eligible"
        assert "refundPercentage" in data, "Falta clave refundPercentage"
        doc.attach_evidence("refund_policy", data)
        doc.finish("Aprobada", observations=f"Política: eligible={data['eligible']}, porcentaje={data['refundPercentage']}%")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
