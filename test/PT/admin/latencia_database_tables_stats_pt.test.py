import sys
import time
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-034", "latencia_database_tables_stats_pt", "PT / Admin",
                             level="PT", test_type="Rendimiento / Latencia", technique="Caja negra")
    doc.set_metadata("Medir latencia de inspección de tablas y estadísticas de base de datos",
                     "Garantizar que el análisis de tablas físicas responda en menos de 1000ms",
                     "MySQL 8.0 live connection", "GET /api/database/tables")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/tables"
    t0 = time.time()
    resp = requests.get(url, headers=headers, timeout=10)
    latency_ms = round((time.time() - t0) * 1000, 2)

    status_ok = resp.status_code == 200
    perf_ok = latency_ms < 1000.0
    doc.add_step(1, "Medir latencia inspección DB", "< 1000ms", f"{latency_ms} ms (HTTP {resp.status_code})", "✓" if perf_ok and status_ok else "✗")

    doc.attach_evidence("performance_telemetry", {"latency_ms": latency_ms, "threshold_ms": 1000.0, "status": resp.status_code})
    success = status_ok and perf_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
