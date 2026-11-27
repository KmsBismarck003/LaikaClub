import sys
import requests
import time
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-022", "flujo_administracion_ciclo_vida_usuario_uat", "UAT / Admin",
                             level="UAT", test_type="Aceptación de Usuario", technique="Caja negra")
    doc.set_metadata("Ciclo de vida completo de administración de usuarios por el Administrador",
                     "Crear usuario administrativo, cambiar su status a suspended y eliminarlo",
                     "Admin autenticado", "CRUD /api/admin/users")
    doc.start()
    headers = get_admin_auth_headers()
    unique_email = f"qa_sub_{int(time.time())}@laikaclub.com"

    # 1. Crear
    create_url = f"{GATEWAY_URL}/api/admin/users"
    create_payload = {
        "first_name": "QA",
        "last_name": "AdminSub",
        "email": unique_email,
        "phone": "5559876543",
        "password": "Password123!",
        "role": "gestor"
    }
    r_create = requests.post(create_url, json=create_payload, headers=headers, timeout=10)
    created_ok = r_create.status_code == 200
    user_id = r_create.json().get("user_id") if created_ok else None
    doc.add_step(1, "Crear nuevo usuario administrativo", "HTTP 200 y user_id asignado", f"HTTP {r_create.status_code}, id={user_id}", "✓" if created_ok and user_id else "✗")

    # 2. Modificar status
    status_updated = False
    if user_id:
        patch_url = f"{GATEWAY_URL}/api/admin/users/{user_id}/status"
        r_patch = requests.patch(patch_url, json={"status": "suspended"}, headers=headers, timeout=10)
        status_updated = r_patch.status_code == 200
    doc.add_step(2, "Suspender cuenta de usuario", "HTTP 200", f"HTTP {r_patch.status_code if user_id else 'N/A'}", "✓" if status_updated else "✗")

    # 3. Eliminar
    deleted = False
    if user_id:
        del_url = f"{GATEWAY_URL}/api/admin/users/{user_id}"
        r_del = requests.delete(del_url, headers=headers, timeout=10)
        deleted = r_del.status_code == 200
    doc.add_step(3, "Eliminar usuario de prueba", "HTTP 200", f"HTTP {r_del.status_code if user_id else 'N/A'}", "✓" if deleted else "✗")

    doc.attach_evidence("user_lifecycle", {"email": unique_email, "created": created_ok, "suspended": status_updated, "deleted": deleted})
    success = created_ok and status_updated and deleted
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
