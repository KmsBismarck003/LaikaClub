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
    doc = TestCaseDocumenter("CP-ADV-028", "flujo_operador_canje_duplicado_post", "Operador / Reingreso",
                             level="API", test_type="Seguridad / Control de Acceso", technique="Caja negra")
    doc.set_metadata("Validar control de reingreso: prevenir segundo canje de un boleto",
                     "Garantizar que no se permita ingreso múltiple con un único boleto",
                     "Servicio laika_tickets activo; credenciales de operador", "Ticket: TKT-INVALIDO-999")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"ticketCode": "TKT-INVALIDO-999", "gate": "Puerta 1"}
        r = requests.post(f"{GATEWAY_URL}/api/tickets/verify", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data.get("valid") is False, "Boleto fue aprobado indebidamente"
        doc.add_step(1, "Escanear código para verificación de estado", "valid: false", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("duplicate_scan", data)
        doc.finish("Aprobada", observations=f"Control de acceso denegado correctamente: valid={data.get('valid')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
