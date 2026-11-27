import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import TICKETS_SERVICE_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-023", "operador_tickets_health_oat", "OAT / Operador",
                             level="OAT", test_type="Operativo / Disponibilidad", technique="Caja negra")
    doc.set_metadata("Comprobar disponibilidad operativa del microservicio Tickets (/health)",
                     "Garantizar que el motor de validación de boletos responda con estado saludable",
                     "Ruta pública de Pilgrim Gateway", f"GET {TICKETS_SERVICE_URL}/health")
    doc.start()
    resp = requests.get(f"{TICKETS_SERVICE_URL}/health", timeout=5)
    data = resp.json() if resp.status_code == 200 else {}
    service_status = str(data.get("status", "")).lower()
    ok = resp.status_code == 200 and service_status in {"alive", "healthy", "up", "ok"}
    doc.add_step(1, f"Health check de Tickets ({TICKETS_SERVICE_URL}/health)", "HTTP 200 y status saludable", f"HTTP {resp.status_code}, status={data.get('status')}", "✓" if ok else "✗")
    doc.attach_evidence("tickets_health_oat", data)
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
