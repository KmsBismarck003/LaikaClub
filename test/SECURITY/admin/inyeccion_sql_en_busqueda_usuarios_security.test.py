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
    doc = TestCaseDocumenter("CP-ADM-039", "inyeccion_sql_en_busqueda_usuarios_security", "SECURITY / Admin",
                             level="SECURITY", test_type="Seguridad / SQLi", technique="Caja negra")
    doc.set_metadata("Verificar inmunidad a inyecciones SQL en la búsqueda de usuarios",
                     "Garantizar que payloads SQL no alteren la lógica de consulta ni provoquen errores de base de datos",
                     "Admin autenticado", "search=' OR '1'='1")
    doc.start()
    headers = get_admin_auth_headers()
    payload_sqli = "' OR '1'='1"
    url = f"{GATEWAY_URL}/api/admin/users?search={payload_sqli}&limit=5"
    resp = requests.get(url, headers=headers, timeout=10)
    # Debe ser 200 manejado limpiamente como string literal o 400, sin error 500 de SQL
    no_sql_crash = resp.status_code in [200, 400] and "SQL" not in resp.text and "syntax" not in resp.text.lower()
    doc.add_step(1, "Inyectar payload SQLi en search", "HTTP 200/400 sin error de sintaxis SQL", f"HTTP {resp.status_code}", "✓" if no_sql_crash else "✗")

    doc.attach_evidence("sqli_test_output", {"status": resp.status_code, "payload": payload_sqli, "safe": no_sql_crash})
    doc.finish("Aprobada" if no_sql_crash else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
