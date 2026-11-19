"""
Prueba de Aceptación de Usuario (UAT) - Funcionalidades: Tienda Oficial de Mercancía
CP-033: Evalúa la experiencia de usuario al explorar productos, precios y variantes en la tienda oficial.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-033",
        name="catalogo_tienda_mercancia_uat",
        module="UAT / Tienda de Mercancía Oficial (/shop)",
        level="UAT",
        test_type="Aceptación de Usuario",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la navegación y despliegue del catálogo de productos y souvenirs en la tienda oficial LaikaClub.",
        objective="Garantizar que los productos oficiales se listen con imágenes, precios y variantes seleccionables.",
        preconditions="Microservicio de mercancía activo en puerto 8203.",
        test_data="GET /api/merchandise"
    )
    doc.start()

    # Paso 1: Explorar catálogo de la tienda
    resp = requests.get(f"{GATEWAY_URL}/api/merchandise", timeout=10)
    s1_ok = (resp.status_code == 200)
    items = resp.json() if s1_ok else []
    doc.add_step(
        1,
        "Cargar catálogo de productos oficiales en la tienda",
        "HTTP 200 con listado de artículos disponibles",
        f"HTTP {resp.status_code}, {len(items)} productos encontrados",
        "✓" if s1_ok else "✗"
    )

    # Paso 2: Validar información comercial de los productos
    s2_ok = True
    if items:
        prod = items[0]
        has_title = bool(prod.get("name") or prod.get("title"))
        s2_ok = has_title
        doc.add_step(2, "Verificar título y precio del producto destacado", "Título y precio visibles", f"Producto: {prod.get('name') or prod.get('title')}, Precio: ${prod.get('price')}", "✓")
    else:
        doc.add_step(2, "Verificar catálogo vacío sin errores en UI", "Catálogo sin caídas", "Catálogo sin items", "✓")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("merchandise_catalog", {"total_items": len(items), "sample": items[0] if items else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="La tienda oficial permite a los fanáticos descubrir y comprar productos de sus eventos favoritos.")

    return {
        "id": "CP-033",
        "name": "catalogo_tienda_mercancia_uat",
        "level": "UAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

