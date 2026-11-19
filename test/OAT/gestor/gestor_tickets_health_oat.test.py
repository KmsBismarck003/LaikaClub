import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import TICKETS_SERVICE_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-027", "gestor_tickets_health_oat", "OAT / Gestor",
                             level="OAT", test_type="Operativo / Disponibilidad", technique="Caja negra")
    doc.set_metadata("Comprobar disponibilidad del microservicio Tickets (/health)",
                     "Garantizar que el servicio de emisión y cuotas responda UP",
                     "Ruta pública de Pilgrim Gateway", f"GET {TICKETS_SERVICE_URL}/health")
    doc.start()
    resp = requests.get(f"{TICKETS_SERVICE_URL}/health", timeout=5)
    ok = resp.status_code == 200
    doc.add_step(1, f"Health check de Tickets ({TICKETS_SERVICE_URL}/health)", "HTTP 200", f"HTTP {resp.status_code}", "✓" if ok else "✗")
    doc.attach_evidence("tickets_health", {"status": resp.status_code, "body": resp.text[:100]})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
