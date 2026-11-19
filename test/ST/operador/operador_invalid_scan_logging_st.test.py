import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-017", "operador_invalid_scan_logging_st", "ST / Operador",
                             level="ST", test_type="Seguridad / Registro", technique="Caja negra")
    doc.set_metadata("Evaluar que los intentos de acceso con boletos inválidos se auditen",
                     "Garantizar que un escaneo de código inexistente quede registrado en la base de datos",
                     "Código inválido", "POST /api/tickets/verify con TKT-FRAUDE-999")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-FRAUDE-999"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    is_invalid = data.get("statusCode") == "INVALID_CODE"
    doc.add_step(1, "Verificar boleto apócrifo", "statusCode=INVALID_CODE", f"statusCode={data.get('statusCode')}", "✓" if is_invalid else "✗")

    # Consultar si quedó en el historial
    r_hist = requests.get(f"{GATEWAY_URL}/api/tickets/validations/ticket/TKT-FRAUDE-999", headers=headers, timeout=10)
    hist_data = r_hist.json() if r_hist.status_code == 200 else []
    logged = len(hist_data) > 0
    doc.add_step(2, "Verificar persistencia en bitácora", "Al menos 1 log para TKT-FRAUDE-999", f"Logs registrados: {len(hist_data)}", "✓" if logged else "✗")

    success = is_invalid and logged
    doc.attach_evidence("invalid_scan_check", {"verify": data, "logs_count": len(hist_data)})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
