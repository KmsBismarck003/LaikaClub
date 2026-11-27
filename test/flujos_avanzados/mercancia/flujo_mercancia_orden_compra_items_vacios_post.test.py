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
    doc = TestCaseDocumenter("CP-ADV-019", "flujo_mercancia_orden_compra_items_vacios_post", "Mercancía / Pedidos",
                             level="API", test_type="Validación / Carrito", technique="Caja negra")
    doc.set_metadata("Validar integridad de orden de compra: rechazo de pedido de mercancía con carrito vacío",
                     "Garantizar que no se generen órdenes sin artículos en laika_merchandise",
                     "Servicio laika_merchandise activo", "items: []")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"items": [], "shipping_address": "Av. Vallarta 100"}
        r = requests.post(f"{GATEWAY_URL}/api/merchandise/orders/", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Debe rechazar orden vacía
        assert r.status_code in [400, 401, 422], f"Status inesperado: {r.status_code}"
        doc.add_step(1, "Enviar orden de mercancía sin artículos", "HTTP 4xx de rechazo", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("empty_order_rejection", {"status_code": r.status_code})
        doc.finish("Aprobada", observations=f"Orden vacía rechazada correctamente: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
