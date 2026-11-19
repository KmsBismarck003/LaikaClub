import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-017", "gestor_events_filtering_st", "ST / Gestor",
                             level="ST", test_type="Funcional / Filtros", technique="Caja negra")
    doc.set_metadata("Evaluar consistencia de filtrado de eventos de gestor",
                     "Verificar categorización y estado de los eventos retornados",
                     "Eventos cargados en la plataforma", "GET /api/manager/events")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    all_have_status = all("status" in ev for ev in data)
    all_have_name = all("name" in ev for ev in data)
    ok = resp.status_code == 200 and all_have_status and all_have_name
    doc.add_step(1, "Validar integridad estructural en eventos", "status y name presentes", f"Total: {len(data)}", "✓" if ok else "✗")
    doc.attach_evidence("events_structure", {"count": len(data), "valid": ok})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
