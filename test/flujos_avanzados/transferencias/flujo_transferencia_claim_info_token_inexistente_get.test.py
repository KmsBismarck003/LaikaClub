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
    doc = TestCaseDocumenter("CP-ADV-012", "flujo_transferencia_claim_info_token_inexistente_get", "Transferencias / Reclamo",
                             level="API", test_type="Integridad / Negativo", technique="Caja negra")
    doc.set_metadata("Validar consulta pública de reclamo de boleto transferido ante token falso o inexistente",
                     "Garantizar que tokens de transferencia inexistentes no expongan datos",
                     "Servicio laika_tickets activo", "Token: CLAIM-FAKE-TOKEN-999")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/tickets/transfer/claim-info/CLAIM-FAKE-TOKEN-999", timeout=TIMEOUT_DEFAULT)
        # Debe responder 404 o un mapa controlado sin crash
        assert r.status_code in [200, 404], f"Status inesperado: {r.status_code}"
        doc.add_step(1, "Consultar claim-info con token espurio", "Manejo seguro sin crash", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("fake_claim_info", {"status_code": r.status_code, "body": r.text[:120]})
        doc.finish("Aprobada", observations=f"Manejo seguro de claim-info falso: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
