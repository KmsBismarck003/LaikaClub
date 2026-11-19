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
    doc = TestCaseDocumenter("CP-ADM-046", "exploratorio_ids_inexistentes_en_usuarios_et", "ET / Admin",
                             level="ET", test_type="Exploratorio / Casos Límite", technique="Caja negra")
    doc.set_metadata("Exploración de operaciones sobre usuarios inexistentes (ID: 99999999)",
                     "Comprobar respuesta adecuada ante intentos de cambio de estado o borrado de ID inexistente",
                     "Admin autenticado", "PATCH /api/admin/users/99999999/status")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/admin/users/99999999/status"
    resp = requests.patch(url, json={"status": "suspended"}, headers=headers, timeout=10)
    handled = resp.status_code in [404, 400, 500]  # Verifica que responda sin colapsar el gateway
    doc.add_step(1, "Modificar estado de ID inexistente", "Respuesta controlada", f"HTTP {resp.status_code}", "✓" if handled else "✗")

    doc.attach_evidence("non_existent_id", {"status": resp.status_code, "body": resp.text[:200]})
    doc.finish("Aprobada" if handled else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
