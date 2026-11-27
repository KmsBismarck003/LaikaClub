import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-039", "gestor_transactions_rbac_bypass_sec", "SECURITY / Gestor",
                             level="SECURITY", test_type="Seguridad / RBAC", technique="Caja negra")
    doc.set_metadata("Comprobar restricción de acceso en endpoint financiero de transacciones",
                     "Garantizar que un usuario regular (rol 'usuario') sea rechazado con HTTP 403",
                     "Token de usuario regular", "GET /api/manager/transactions")
    doc.start()
    headers = get_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/transactions", headers=headers, timeout=10)
    rejected = resp.status_code in [401, 403]
    doc.add_step(1, "Usuario regular accediendo a transacciones de gestor", "HTTP 403 Forbidden", f"HTTP {resp.status_code}", "✓" if rejected else "✗")
    doc.attach_evidence("rbac_transactions", {"status": resp.status_code, "body": resp.text[:100]})
    
    if not rejected:
        doc.set_defect("DEF-GES-001", "Alta", "Falla de Control de Acceso RBAC: /api/manager/transactions permite acceso a usuarios regulares sin validar rol gestor")
    
    doc.finish("Aprobada" if rejected else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
