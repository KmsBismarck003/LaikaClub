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
    doc = TestCaseDocumenter("CP-ADV-032", "flujo_logros_cupon_invalido_post", "Logros / Cupones",
                             level="API", test_type="Validación / Negativo", technique="Caja negra")
    doc.set_metadata("Validar rechazo ante intento de aplicar un código de cupón inexistente o inventado",
                     "Comprobar que cupones falsos no otorguen descuentos indebidos",
                     "Servicio laika_achievements activo", "Código: CUPON-FALSO-999")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"code": "CUPON-FALSO-999"}
        r = requests.post(f"{GATEWAY_URL}/api/achievements/coupons/validate", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data.get("valid") is False, "Cupón inexistente fue marcado como válido"
        doc.add_step(1, "Validar cupón espurio", "valid: false en respuesta", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("fake_coupon_validation", data)
        doc.finish("Aprobada", observations=f"Cupón inválido rechazado: valid={data.get('valid')}, detail={data.get('detail')}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
