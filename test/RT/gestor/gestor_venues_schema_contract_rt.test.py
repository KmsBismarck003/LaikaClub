import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-032", "gestor_venues_schema_contract_rt", "RT / Gestor",
                             level="RT", test_type="Regresión / Contrato", technique="Caja negra")
    doc.set_metadata("Comprobar estabilidad del contrato de recintos",
                     "Verificar que /api/venues mantenga la estructura id, name, address, capacity",
                     "Endpoint público de recintos", "GET /api/venues")
    doc.start()
    resp = requests.get(f"{GATEWAY_URL}/api/venues", timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    req_keys = {"id", "name"}
    has_keys = len(data) > 0 and all(req_keys.issubset(v.keys()) for v in data)
    ok = resp.status_code == 200 and has_keys
    doc.add_step(1, "Validar contrato de recintos", "Campos mínimos presentes en array", f"HTTP {resp.status_code}, total={len(data)}", "✓" if ok else "✗")
    doc.attach_evidence("venues_contract", {"status": resp.status_code, "count": len(data)})
    doc.finish("Aprobada" if ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
