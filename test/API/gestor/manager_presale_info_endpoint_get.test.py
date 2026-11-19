import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-060", "manager_presale_info_endpoint_get", "API / Gestor",
                             level="API", test_type="Funcional / Preventa", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint GET /api/presale/{event_id}/info",
                     "Validar consulta pública de información y estado de preventa para un evento",
                     "Evento ID 100001", "GET /api/presale/100001/info")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/presale/100001/info", timeout=10)
    data = resp.json() if resp.status_code == 200 else {}
    ok = resp.status_code == 200 and "presale_enabled" in data
    doc.add_step(1, "GET /api/presale/100001/info", "HTTP 200 con presale_enabled", f"HTTP {resp.status_code}, enabled={data.get('presale_enabled')}", "✓" if ok else "✗")
    if not ok:
        doc.set_defect("DEF-GES-003", "Alta", "Falta ruta de API Gateway: /api/presale/** no está enrutado hacia microservicio Events")
    doc.attach_evidence("http_response", {"status": resp.status_code, "data": data})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
