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
    doc = TestCaseDocumenter("CP-GES-019", "gestor_venue_rooms_capacity_st", "ST / Gestor",
                             level="ST", test_type="Funcional / Recintos", technique="Caja negra")
    doc.set_metadata("Evaluar consulta y estructura de salas para recintos del gestor",
                     "Verificar endpoint GET /api/venues/12/rooms",
                     "Recinto ID 12", "GET /api/venues/12/rooms")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/venues/12/rooms", headers=headers, timeout=10)
    ok = resp.status_code == 200 and isinstance(resp.json(), list)
    doc.add_step(1, "Consultar salas del recinto 12", "HTTP 200 con lista de salas", f"HTTP {resp.status_code}, salas={len(resp.json()) if ok else 'N/A'}", "✓" if ok else "✗")
    doc.attach_evidence("venue_rooms", {"status": resp.status_code, "rooms": resp.json() if ok else []})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
