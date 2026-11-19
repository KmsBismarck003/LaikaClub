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
    doc = TestCaseDocumenter("CP-ADV-031", "flujo_logros_cupon_validate_post", "Logros / Cupones",
                             level="API", test_type="Funcional / Checkout", technique="Caja negra")
    doc.set_metadata("Validar endpoint de validación de cupones de descuento antes de aplicarlo en el checkout",
                     "Garantizar que el sistema verifique vigencia y pertenencia del cupón",
                     "Servicio laika_achievements activo", "Código: LAIKA-01-2WBIEP")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"code": "LAIKA-01-2WBIEP"}
        r = requests.post(f"{GATEWAY_URL}/api/achievements/coupons/validate", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "valid" in data, "Falta clave 'valid'"
        doc.add_step(1, "Validar cupón de descuento", "HTTP 200 con objeto de validación", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("coupon_validation_data", data)
        doc.finish("Aprobada", observations=f"Validación de cupón procesada: valid={data.get('valid')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
