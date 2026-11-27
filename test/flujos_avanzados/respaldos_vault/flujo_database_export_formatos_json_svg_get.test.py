import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-050", "flujo_database_export_formatos_json_svg_get", "Base de Datos / Exportaciones",
                             level="API", test_type="Funcional / Auditoría", technique="Caja negra")
    doc.set_metadata("Validar exportación del esquema y datos relacionales en formatos JSON y diagrama SVG",
                     "Comprobar disponibilidad de exportaciones estructurales para documentación y auditoría",
                     "Servicio laika_admin activo; credenciales admin", "Ruta: GET /api/database/export/json y /api/database/export/svg")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        r_json = requests.get(f"{GATEWAY_URL}/api/database/export/json", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_json.status_code == 200, f"Fallo en exportación JSON: {r_json.status_code}"
        doc.add_step(1, "Exportar esquema en JSON", "HTTP 200 con payload JSON", f"HTTP {r_json.status_code}", "✓")
        
        r_svg = requests.get(f"{GATEWAY_URL}/api/database/export/svg", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_svg.status_code == 200, f"Fallo en exportación SVG: {r_svg.status_code}"
        doc.add_step(2, "Exportar diagrama en SVG", "HTTP 200 con gráfico vectorial", f"HTTP {r_svg.status_code}", "✓")
        doc.attach_evidence("database_exports", {"json_status": r_json.status_code, "svg_status": r_svg.status_code})
        doc.finish("Aprobada", observations="Exportaciones JSON y SVG validadas exitosamente")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
