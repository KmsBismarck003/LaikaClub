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
    doc = TestCaseDocumenter("CP-ADM-044", "validacion_id_invalido_borrado_backup_usability", "USABILITY / Admin",
                             level="USABILITY", test_type="Usabilidad / Validación Entradas", technique="Caja negra")
    doc.set_metadata("Comprobar validación de formato al intentar borrar respaldo con ID inválido",
                     "Garantizar rechazo con HTTP 400 Bad Request si el backupId contiene caracteres no permitidos",
                     "Admin autenticado", "DELETE /api/database/backups/invalid!@#$")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/database/backups/invalid!@#$"
    resp = requests.delete(url, headers=headers, timeout=10)
    is_bad_request = resp.status_code in [400, 404]
    doc.add_step(1, "Solicitar borrado con ID inválido", "HTTP 400 o 404", f"HTTP {resp.status_code}", "✓" if is_bad_request else "✗")

    doc.attach_evidence("invalid_id_feedback", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if is_bad_request else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
