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
    doc = TestCaseDocumenter("CP-ADV-017", "flujo_mercancia_catalogo_publico_get", "Mercancía / Catálogo",
                             level="API", test_type="Funcional / Tienda", technique="Caja negra")
    doc.set_metadata("Validar consulta pública de detalle de artículo y catálogo de mercancía oficial",
                     "Comprobar disponibilidad de catálogo para compras en línea",
                     "Servicio laika_merchandise activo", "Item ID: 99 / Catálogo general")
    doc.start()
    try:
        headers = get_auth_headers()
        r = requests.get(f"{GATEWAY_URL}/api/merchandise", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado en catálogo: {r.status_code}"
        items = r.json()
        assert len(items) > 0, "Catálogo de mercancía vacío"
        doc.add_step(1, "Consultar catálogo público /api/merchandise", "HTTP 200 con listado", f"HTTP {r.status_code} ({len(items)} items)", "✓")
        
        # Consultar detalle del primer artículo (ID 99)
        first_id = items[0].get("id", 99)
        r_item = requests.get(f"{GATEWAY_URL}/api/merchandise/{first_id}", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_item.status_code == 200, f"Status inesperado en item {first_id}: {r_item.status_code}"
        doc.add_step(2, f"Consultar detalle de artículo {first_id}", "HTTP 200 con atributos y variantes", f"HTTP {r_item.status_code}", "✓")
        
        doc.attach_evidence("merch_detail", {"catalog_count": len(items), "sample_item": r_item.json()})
        doc.finish("Aprobada", observations=f"Catálogo y artículo {first_id} consultados exitosamente (HTTP 200, {len(items)} items)")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
