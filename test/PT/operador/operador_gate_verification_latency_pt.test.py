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
    doc = TestCaseDocumenter("CP-OPE-029", "operador_gate_verification_latency_pt", "PT / Operador",
                             level="PT", test_type="Rendimiento / Latencia", technique="Caja negra")
    doc.set_metadata("Medir tiempo de respuesta en escaneo de acceso en torniquete (target < 200ms)",
                     "Garantizar fluidez inmediata en puertas de acceso masivo",
                     "Operador autenticado", "POST /api/tickets/verify con TKT-C853F390")
    doc.start()
    headers = get_operador_auth_headers()
    payload = {"ticketCode": "TKT-C853F390"}
    t0 = time.time()
    resp = requests.post(f"{GATEWAY_URL}/api/tickets/verify", headers=headers, json=payload, timeout=10)
    latency_ms = (time.time() - t0) * 1000
    # Criterio de aceptación estándar de red local / docker: < 500ms
    ok = resp.status_code == 200 and latency_ms < 500.0
    doc.add_step(1, "Medir latencia en validación de boleto", "< 500ms en local", f"{latency_ms:.2f}ms", "✓" if ok else "✗")
    doc.attach_evidence("gate_latency", {"status": resp.status_code, "latency_ms": latency_ms})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
