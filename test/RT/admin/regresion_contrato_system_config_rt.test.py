import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-032", "regresion_contrato_system_config_rt", "RT / Admin",
                             level="RT", test_type="Regresión / Contratos", technique="Caja negra")
    doc.set_metadata("Validar contrato de respuesta de configuración runtime en /api/config",
                     "Comprobar presencia de campos requeridos por el frontend de administración",
                     "Admin autenticado", "GET /api/config")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/config"
    resp = requests.get(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Solicitar configuración global", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    expected_keys = ["registrationEnabled", "maxTicketsPerUser", "sessionTimeout", "maintenanceMode"]
    missing = [k for k in expected_keys if k not in data]
    doc.add_step(2, "Verificar claves maestras", "Cero claves faltantes", f"Faltantes: {missing}", "✓" if len(missing) == 0 else "✗")

    doc.attach_evidence("runtime_config_contract", data)
    success = status_ok and len(missing) == 0
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
