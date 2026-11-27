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
    doc = TestCaseDocumenter("CP-ADM-043", "validacion_campos_requeridos_crear_usuario_usability", "USABILITY / Admin",
                             level="USABILITY", test_type="Usabilidad / Mensajes de Error", technique="Caja negra")
    doc.set_metadata("Verificar mensajes de validación al crear usuario sin correo ni contraseña",
                     "Comprobar que el sistema responda con retroalimentación clara para el administrador",
                     "Admin autenticado", "POST /api/admin/users con payload vacío")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users"
    resp = requests.post(url, json={}, headers=headers, timeout=10)
    has_clear_error = resp.status_code in [400, 500] and len(resp.text) > 0
    doc.add_step(1, "Enviar creación sin campos obligatorios", "Respuesta de error descriptiva", f"HTTP {resp.status_code} ({resp.text[:60]})", "✓" if has_clear_error else "✗")

    doc.attach_evidence("validation_feedback", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if has_clear_error else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
