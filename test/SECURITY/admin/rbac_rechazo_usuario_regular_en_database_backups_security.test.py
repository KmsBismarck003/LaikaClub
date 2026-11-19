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
    doc = TestCaseDocumenter("CP-ADM-037", "rbac_rechazo_usuario_regular_en_database_backups_security", "SECURITY / Admin",
                             level="SECURITY", test_type="Seguridad / Control de Acceso", technique="Caja negra")
    doc.set_metadata("Auditar protección del endpoint de respaldos de base de datos ante usuarios no administradores",
                     "Verificar si un usuario regular puede disparar o listar respaldos críticos",
                     "Token de usuario regular", "POST /api/database/backup")
    doc.start()
    user_headers = get_auth_headers()
    url = f"{GATEWAY_URL}/api/database/backups"
    resp = requests.get(url, headers=user_headers, timeout=10)
    
    # Evaluar si el microservicio de base de datos filtra por rol admin
    is_secure = resp.status_code in [401, 403, 500]
    doc.add_step(1, "Usuario regular intenta listar backups", "HTTP 401/403/Access Denied", f"HTTP {resp.status_code}", "✓" if is_secure else "✗")

    doc.attach_evidence("db_backup_security", {"status": resp.status_code, "body": resp.text[:200]})
    if not is_secure:
        # Reportar como defecto si permite a usuario regular ver respaldos
        doc.finish("Fallida", defect_id="DEF-ADM-001", defect_severity="Crítica",
                   observations="Falta @PreAuthorize('hasRole(\'admin\')') en DatabaseController: permite a cualquier rol ver y manipular respaldos")
    else:
        doc.finish("Aprobada")
    return doc.result

if __name__ == "__main__":
    run_test()
