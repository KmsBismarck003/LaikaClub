import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-030", "flujo_logros_beneficios_cupones_get", "Logros / Beneficios",
                             level="API", test_type="Funcional / Beneficios", technique="Caja negra")
    doc.set_metadata("Validar entrega de beneficios: consulta de cupones de descuento otorgados por logros",
                     "Comprobar que el usuario reciba los cupones asociados a su nivel de fidelización",
                     "Servicio laika_achievements activo; usuario autenticado", "N/A")
    doc.start()
    try:
        headers = get_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/achievements/coupons", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "El cuerpo devuelto debe ser una lista"
        assert len(data) > 0, "No se encontraron cupones de recompensa para el usuario"
        first = data[0]
        assert "code" in first, "Falta clave code en cupón"
        assert "discountValue" in first, "Falta valor de descuento"
        doc.add_step(1, "Consultar cupones de fidelización", "HTTP 200 OK con lista de cupones", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("user_coupons", {"total": len(data), "sample": first})
        doc.finish("Aprobada", observations=f"200 OK obtenido con {len(data)} cupones activos (ej. {first.get('code')})")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
