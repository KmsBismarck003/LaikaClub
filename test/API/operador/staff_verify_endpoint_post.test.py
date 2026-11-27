import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-044", "staff_verify_endpoint_post", "API / Operador",
                             level="API", test_type="Funcional / REST", technique="Caja negra")
    doc.set_metadata("Validar que POST /api/staff/verify responda 200 OK con payload estructurado de validación de ticket.",
                     "Comprobar contrato de respuesta de verificación para terminales de control de acceso",
                     "Servicio laika_tickets y gateway activos; token de operador.", "Ticket: TKT-C853F390")
    doc.start()
    try:
        headers = get_operador_auth_headers()
        payload = {"ticketCode": "TKT-C853F390", "gate": "Puerta Norte 01", "deviceId": "SCANNER-01"}
        r = requests.post(f"{GATEWAY_URL}/api/staff/verify", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Enviar POST /api/staff/verify", "HTTP 200 OK", f"HTTP {r.status_code}", "✓" if r.status_code == 200 else "✗")
        assert r.status_code == 200, f"Expected 200 OK, got {r.status_code}"
        
        data = r.json()
        assert "valid" in data, "Falta clave 'valid'"
        assert "statusCode" in data, "Falta clave 'statusCode'"
        
        doc.attach_evidence("staff_verify_response", data)
        doc.finish("Aprobada", observations=f"200 OK verificado, statusCode={data['statusCode']}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
