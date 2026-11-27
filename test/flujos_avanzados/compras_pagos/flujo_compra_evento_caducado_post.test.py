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
    doc = TestCaseDocumenter("CP-ADV-004", "flujo_compra_evento_caducado_post", "Compras / Temporalidad",
                             level="API", test_type="Reglas de Negocio", technique="Caja negra")
    doc.set_metadata("Validar control de admisión temporal: rechazar compra en evento con fecha pasada o caducada",
                     "Impedir venta extemporánea de boletaje",
                     "Servicio laika_tickets activo; Evento 19 histórico", "Evento ID: 19 (fecha pasada)")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"eventId": 19, "seatCode": "CAD-01"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/free", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Debe denegarse la compra por cortesía en evento pasado
        assert r.status_code in [400, 403, 404], f"Evento caducado admitió compra con código {r.status_code}"
        doc.add_step(1, "Intentar compra en evento caducado", "Rechazo controlado (HTTP 4xx)", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("compra_caducado", {"status_code": r.status_code, "text": r.text[:120]})
        doc.finish("Aprobada", observations=f"Venta en evento caducado denegada correctamente: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
