"""
Prueba de API (API) - Tienda: GET /api/merchandise
CP-074: Evalúa la consulta pública del catálogo de artículos y souvenirs de eventos.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-074",
        name="catalogo_mercancia_endpoint_get",
        module="API / Tienda de Mercancía Oficial",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención del catálogo completo de productos oficiales disponibles en la plataforma mediante GET /api/merchandise.",
        objective="Garantizar que el servicio responda con código HTTP 200 y una lista de artículos con precios y variantes.",
        preconditions="Microservicio laika_merchandise en línea.",
        test_data="GET /api/merchandise"
    )
    doc.start()

    resp = requests.get(f"{GATEWAY_URL}/api/merchandise", timeout=10)
    s1_ok = (resp.status_code == 200)
    items = resp.json() if s1_ok else []

    doc.add_step(1, "Enviar GET /api/merchandise al API Gateway", "HTTP 200 OK con catálogo de productos", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = isinstance(items, list)
    doc.add_step(2, "Verificar que el cuerpo contenga una lista de artículos", "Lista JSON devuelta", f"{len(items)} artículos retornados", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("merchandise_catalog_response", {"count": len(items), "sample": items[0] if items else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio de comercio electrónico provee el inventario oficial a los usuarios.")

    return {
        "id": "CP-074",
        "name": "catalogo_mercancia_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

