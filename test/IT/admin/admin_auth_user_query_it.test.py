import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-009", "admin_auth_user_query_it", "IT / Admin",
                             level="IT", test_type="Integración Repositorio", technique="Caja gris")
    doc.set_metadata("Consultar cuenta de administrador activa en la base laika_auth",
                     "Garantizar que existe al menos un usuario con rol 'admin' y status 'active'",
                     "Tabla laika_auth.users", "role = 'admin'")
    doc.start()
    admins = execute_query("laika_auth", "SELECT id, email, role, status FROM users WHERE role = 'admin' AND status = 'active';")
    has_admin = len(admins) >= 1
    doc.add_step(1, "Verificar existencia de cuenta admin", "Count >= 1", f"Encontrados: {len(admins)}", "✓" if has_admin else "✗")
    doc.attach_evidence("admin_users", admins)
    doc.finish("Aprobada" if has_admin else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
