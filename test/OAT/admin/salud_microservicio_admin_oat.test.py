import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import ADMIN_SERVICE_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-026", "salud_microservicio_admin_oat", "OAT / Admin",
                             level="OAT", test_type="Disponibilidad Operativa", technique="Caja negra")
    doc.set_metadata("Verificar estado operativo y endpoint /health del microservicio laika_admin",
                     "Garantizar que el servicio admin reporte un estado saludable",
                     "Ruta pública de Pilgrim Gateway", f"GET {ADMIN_SERVICE_URL}/health")
    doc.start()
    url = f"{ADMIN_SERVICE_URL}/health"
    resp = requests.get(url, timeout=5)
    status_ok = resp.status_code == 200
    doc.add_step(1, f"GET {ADMIN_SERVICE_URL}/health", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    service_status = str(data.get("status", "")).lower()
    is_healthy = service_status in {"alive", "healthy", "up", "ok"}
    doc.add_step(2, "Verificar payload de salud", "status saludable", f"status={data.get('status')}", "✓" if is_healthy else "✗")

    doc.attach_evidence("health_payload", {"status_code": resp.status_code, "data": data})
    success = status_ok and is_healthy
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
