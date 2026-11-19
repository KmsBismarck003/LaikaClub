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
    doc = TestCaseDocumenter("CP-ADV-027", "flujo_operador_codigo_erroneo_y_falsificado_post", "Operador / Validación",
                             level="API", test_type="Funcional / Detección Fraude", technique="Caja negra")
    doc.set_metadata("Validar respuesta de terminal staff ante escaneo de código QR dañado o falsificado",
                     "Garantizar que la terminal devuelva INVALID_CODE con mensaje claro al operador",
                     "Servicio laika_tickets activo; token de operador", "Ticket: TKT-FAKE-FORGED-999")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"ticketCode": "TKT-FAKE-FORGED-999", "gate": "Puerta Norte"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/verify", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data.get("valid") is False, "Boleto falsificado fue aprobado"
        assert data.get("statusCode") == "INVALID_CODE", f"Status code inesperado: {data.get('statusCode')}"
        doc.add_step(1, "Escanear boleto falsificado", "statusCode: INVALID_CODE", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("forged_scan", data)
        doc.finish("Aprobada", observations=f"Código falsificado rechazado con statusCode={data.get('statusCode')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
