import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-035", "latencia_admin_login_pt", "PT / Admin",
                             level="PT", test_type="Rendimiento / Latencia", technique="Caja negra")
    doc.set_metadata("Medir tiempo de respuesta de autenticación de administrador (BCrypt + JWT)",
                     "Garantizar que el inicio de sesión de admin se complete en menos de 1000ms",
                     "Validación de credenciales reales en vivo", "POST /api/auth/login")
    doc.start()
    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_ADMIN_EMAIL, "password": QA_ADMIN_PASSWORD}
    t0 = time.time()
    resp = requests.post(url, json=payload, timeout=10)
    latency_ms = round((time.time() - t0) * 1000, 2)

    status_ok = resp.status_code == 200
    perf_ok = latency_ms < 1000.0
    doc.add_step(1, "Medir latencia login admin", "< 1000ms", f"{latency_ms} ms (HTTP {resp.status_code})", "✓" if perf_ok and status_ok else "✗")

    doc.attach_evidence("admin_login_perf", {"latency_ms": latency_ms, "status": resp.status_code})
    success = status_ok and perf_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
