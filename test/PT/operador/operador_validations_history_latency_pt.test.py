import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_operador_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-030", "operador_validations_history_latency_pt", "PT / Operador",
                             level="PT", test_type="Rendimiento / Latencia", technique="Caja negra")
    doc.set_metadata("Medir tiempo de respuesta en consulta de bitácora histórica de validaciones",
                     "Garantizar latencia < 500ms en /api/tickets/validations/history",
                     "Operador autenticado", "GET /api/tickets/validations/history")
    doc.start()
    headers = get_operador_auth_headers()
    t0 = time.time()
    resp = requests.get(f"{GATEWAY_URL}/api/tickets/validations/history", headers=headers, timeout=10)
    latency_ms = (time.time() - t0) * 1000
    ok = resp.status_code == 200 and latency_ms < 500.0
    doc.add_step(1, "Medir latencia en historial de validaciones", "< 500ms", f"{latency_ms:.2f}ms", "✓" if ok else "✗")
    doc.attach_evidence("history_latency", {"status": resp.status_code, "latency_ms": latency_ms})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
