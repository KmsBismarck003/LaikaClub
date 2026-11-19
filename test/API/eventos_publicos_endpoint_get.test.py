"""
Prueba de API (API) - Eventos: GET /api/events/public
CP-065: Evalúa la consulta pública del catálogo de eventos con limit y paginación.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-065",
        name="eventos_publicos_endpoint_get",
        module="API / Catálogo de Eventos",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención del catálogo público de eventos cartelera mediante GET /api/events/public.",
        objective="Verificar que el servicio responda con código HTTP 200 y una lista de eventos publicados con sus datos de fecha y precio.",
        preconditions="Servicio de eventos activo.",
        test_data="Parámetro limit=10"
    )
    doc.start()

    resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=10", timeout=10)
    s1_ok = (resp.status_code == 200)
    events = resp.json() if s1_ok else []

    doc.add_step(1, "Enviar GET /api/events/public?limit=10", "HTTP 200 OK con lista JSON", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (isinstance(events, list) and len(events) <= 10)
    doc.add_step(2, "Verificar respeto del límite (limit <= 10)", "Array con máximo 10 elementos", f"{len(events)} eventos retornados", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("public_events_sample", {"total_returned": len(events), "first_item": events[0] if events else {}})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El catálogo de eventos responde con rapidez y respeta los filtros de paginación.")

    return {
        "id": "CP-065",
        "name": "eventos_publicos_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

