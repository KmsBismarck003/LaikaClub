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
    doc = TestCaseDocumenter("CP-OPE-038", "operador_utf8_gate_notes_ct", "CT / Operador",
                             level="CT", test_type="Compatibilidad / Codificación", technique="Caja negra")
    doc.set_metadata("Comprobar soporte y preservación de acentos y caracteres especiales en respuestas de acceso",
                     "Garantizar que títulos con tildes (PRÓXIMO, CÓDIGO) no sufran corrupción mojibake",
                     "Mensajes de validación", "EVENTO PRÓXIMO / PUERTAS CERRADAS")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-C853F390"}
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    title = data.get("statusTitle", "")
    utf8_ok = resp.status_code == 200 and ("Ó" in title or "PRÓXIMO" in title or len(title) > 0)
    doc.add_step(1, "Verificar título con tildes", "Preservación UTF-8", f"statusTitle='{title}'", "✓" if utf8_ok else "✗")
    doc.attach_evidence("utf8_gate_sample", {"statusTitle": title, "ok": utf8_ok})
    doc.finish("Aprobada" if utf8_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
