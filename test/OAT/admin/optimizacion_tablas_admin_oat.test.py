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
    doc = TestCaseDocumenter("CP-ADM-028", "optimizacion_tablas_admin_oat", "OAT / Admin",
                             level="OAT", test_type="Mantenimiento Operacional", technique="Caja negra")
    doc.set_metadata("Ejecutar procedimiento de optimización física de tablas MySQL",
                     "Comprobar ejecución de POST /api/database/optimize sin errores de servidor",
                     "Admin autenticado", "POST /api/database/optimize")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/optimize"
    resp = requests.post(url, headers=headers, timeout=15)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Disparar optimización de tablas", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    success_flag = data.get("success", False)
    doc.add_step(2, "Verificar respuesta de optimización", "success==True", f"success={success_flag}", "✓" if success_flag else "✗")

    doc.attach_evidence("optimize_result", {"status": resp.status_code, "data": data})
    success = status_ok and success_flag
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
