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
    doc = TestCaseDocumenter("CP-ADM-029", "limpieza_cache_admin_oat", "OAT / Admin",
                             level="OAT", test_type="Mantenimiento Operacional", technique="Caja negra")
    doc.set_metadata("Ejecutar procedimiento de limpieza de memoria caché en el microservicio",
                     "Comprobar ejecución de POST /api/database/clear-cache",
                     "Admin autenticado", "POST /api/database/clear-cache")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/clear-cache"
    resp = requests.post(url, headers=headers, timeout=10)
    status_ok = resp.status_code == 200
    doc.add_step(1, "Disparar limpieza de caché", "HTTP 200", f"HTTP {resp.status_code}", "✓" if status_ok else "✗")

    data = resp.json() if status_ok else {}
    success_flag = data.get("success", False)
    doc.add_step(2, "Verificar flag de éxito", "success==True", f"success={success_flag}", "✓" if success_flag else "✗")

    doc.attach_evidence("clear_cache_result", {"status": resp.status_code, "data": data})
    success = status_ok and success_flag
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
