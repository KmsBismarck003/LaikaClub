import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-020", "flujo_gestor_contratos_b2b_list_get", "B2B / Contratos",
                             level="API", test_type="Funcional / B2B", technique="Caja negra")
    doc.set_metadata("Validar consulta de convenios y contratos B2B disponibles para la producción de eventos",
                     "Comprobar listado de marcos contractuales corporativos en laika_admin",
                     "Servicio laika_admin activo", "N/A")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/b2b/contracts", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "El resultado debe ser una lista"
        doc.add_step(1, "Consultar contratos B2B", "HTTP 200 OK", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("b2b_contracts_list", {"count": len(data)})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} contratos corporativos")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
