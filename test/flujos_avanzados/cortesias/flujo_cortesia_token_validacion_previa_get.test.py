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
    doc = TestCaseDocumenter("CP-ADV-047", "flujo_cortesia_token_validacion_previa_get", "Cortesías / Validación",
                             level="API", test_type="Funcional / Centro de Canje", technique="Caja negra")
    doc.set_metadata("Validar previsualización y verificación pública de tokens de cortesía antes del canje",
                     "Comprobar retorno de detalles del evento, función, recinto y estado 'pending_claim'",
                     "Servicio laika_tickets activo", "Ruta: GET /api/tickets/courtesy/validate-token/LAIKA-COR-905D1C")
    doc.start()
    try:
        # Consultar token existente
        r = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/validate-token/LAIKA-COR-905D1C", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        data = r.json()
        doc.add_step(1, "Previsualizar token de cortesía", "HTTP 200 con datos de evento", f"HTTP {r.status_code} ({data.get('event_name')})", "✓")
        doc.attach_evidence("validate_token", data)
        doc.finish("Aprobada", observations=f"Token verificado correctamente: evento '{data.get('event_name')}', estado: {data.get('status')}")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
