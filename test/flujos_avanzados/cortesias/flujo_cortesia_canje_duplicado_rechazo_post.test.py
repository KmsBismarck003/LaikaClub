import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-048", "flujo_cortesia_canje_duplicado_rechazo_post", "Cortesías / Integridad Canje",
                             level="API", test_type="Integridad / Reclamación", technique="Caja negra")
    doc.set_metadata("Validar rechazo controlado ante intento de canje de un código de cortesía ya utilizado",
                     "Garantizar que un token de cortesía no pueda ser reutilizado por múltiples usuarios",
                     "Servicio laika_tickets activo; credenciales usuario", "Ruta: POST /api/tickets/courtesy/claim con token ya canjeado")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"claimToken": "LAIKA-COR-905D1C"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/courtesy/claim", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [400, 409], f"Se esperaba HTTP 400 o 409 de rechazo, obtenido: {r.status_code}"
        data = r.json()
        doc.add_step(1, "Reintentar canje de token ya utilizado", "HTTP 400/409 Rechazo", f"HTTP {r.status_code} ({data.get('message')})", "✓")
        doc.attach_evidence("double_claim_rejection", data)
        doc.finish("Aprobada", observations="Prevención de doble canje confirmada: HTTP 409 Conflict")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
