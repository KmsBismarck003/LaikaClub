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
    doc = TestCaseDocumenter("CP-OPE-018", "operador_busy_seats_consistency_st", "ST / Operador",
                             level="ST", test_type="Integridad / Asientos", technique="Caja negra")
    doc.set_metadata("Evaluar consistencia de asientos ocupados en taquilla operativa",
                     "Garantizar que /api/tickets/busy-seats/{id} devuelva un array válido de strings",
                     "Evento ID 100001", "GET /api/tickets/busy-seats/100001")
    doc.start()
    headers = get_operador_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/busy-seats/100001", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else None
    ok = resp.status_code == 200 and isinstance(data, list)
    doc.add_step(1, "Validar lista de asientos ocupados", "Array JSON de identificadores", f"HTTP {resp.status_code}, ocupados={len(data) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("busy_seats_check", {"status": resp.status_code, "count": len(data) if ok else 0})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
