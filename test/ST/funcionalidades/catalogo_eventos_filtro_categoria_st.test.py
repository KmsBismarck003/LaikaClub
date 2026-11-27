"""
Prueba de Sistema (ST) - Funcionalidades: Filtrado de Cartelera por Categoría
CP-025: Comprueba la capacidad del catálogo para discriminar eventos según su categoría.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-025",
        name="catalogo_eventos_filtro_categoria_st",
        module="Sistema / Catálogo de Eventos",
        level="ST",
        test_type="Funcional / Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el filtrado dinámico de eventos en el catálogo público usando el parámetro de consulta ?category=",
        objective="Garantizar que al solicitar una categoría específica (ej. 'concert', 'theater'), todos los eventos retornados pertenezcan a dicha categoría.",
        preconditions="Eventos publicados con distintas categorías existentes en la base de datos.",
        test_data="Categorías probadas: 'concert', 'theater'"
    )
    doc.start()

    categories = ["concert", "theater"]
    all_passed = True

    for idx, cat in enumerate(categories, start=1):
        url = f"{GATEWAY_URL}/api/events/public?category={cat}&limit=20"
        resp = requests.get(url, timeout=10)
        s_http = (resp.status_code == 200)
        events = resp.json() if s_http else []

        # Validar que todos los eventos tengan la categoría solicitada
        matches = [e for e in events if str(e.get("category", "")).lower() == cat.lower()]
        all_match = (len(events) > 0 and len(matches) == len(events)) if events else True

        step_ok = s_http and all_match
        if not step_ok:
            all_passed = False

        doc.add_step(
            idx,
            f"Filtrar eventos por categoría '{cat}'",
            f"HTTP 200 y todos los eventos con category='{cat}'",
            f"HTTP {resp.status_code}, {len(events)} eventos ({len(matches)} coincidentes)",
            "✓" if step_ok else "✗"
        )

    doc.attach_evidence("category_filters", categories)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El motor de búsqueda y filtrado de eventos opera consistentemente.")

    return {
        "id": "CP-025",
        "name": "catalogo_eventos_filtro_categoria_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

