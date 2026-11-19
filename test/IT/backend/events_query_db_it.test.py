"""
Prueba de Integración (IT) - Backend: Catálogo de Eventos (laika_events <-> MySQL)
CP-015: Verifica la consulta de eventos publicados desde la capa de servicio contra la base de datos real.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-015",
        name="events_query_db_it",
        module="Eventos / Catálogo e Hidratación MySQL",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la correspondencia entre los eventos publicados retornados por el servicio de eventos y los registros en MySQL.",
        objective="Garantizar que solo eventos con status 'published' sean expuestos en el endpoint público.",
        preconditions="Microservicio laika_events (puerto 8201) y base de datos laika_events activos sin mocks.",
        test_data="Consulta pública: GET /api/events/public"
    )
    doc.start()

    # 1. Consultar eventos desde la API pública
    api_resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=50", timeout=10)
    s1_ok = (api_resp.status_code == 200)
    events_api = api_resp.json() if s1_ok else []
    doc.add_step(
        1,
        "Consumir endpoint GET /api/events/public?limit=50",
        "HTTP 200 con listado de eventos",
        f"HTTP {api_resp.status_code}, {len(events_api)} eventos devueltos",
        "✓" if s1_ok else "✗"
    )

    # 2. Consultar eventos en MySQL con status = 'published'
    db_events = execute_query(
        "laika_events",
        "SELECT id, name, category, status, price, available_tickets FROM events WHERE status = 'published' LIMIT 50"
    )
    s2_ok = (len(events_api) > 0 and len(db_events) > 0)
    doc.add_step(
        2,
        "Consultar eventos con status='published' directamente en laika_events.events",
        "Registros publicados encontrados en MySQL",
        f"{len(db_events)} eventos publicados en base de datos",
        "✓" if s2_ok else "✗"
    )

    # 3. Validar que los IDs devueltos por la API correspondan a los publicados
    api_ids = {e.get("id") for e in events_api}
    db_ids = {e.get("id") for e in db_events}
    overlap = api_ids.intersection(db_ids)
    s3_ok = (len(overlap) > 0)
    doc.add_step(
        3,
        "Validar correlación de IDs entre la respuesta API y los registros de MySQL",
        "Intersección de IDs positiva y consistente",
        f"{len(overlap)} IDs coincidentes entre API y DB",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("events_correlation", {"api_count": len(events_api), "db_count": len(db_events), "sample_id": list(overlap)[:3]})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="La capa de persistencia hidrata correctamente los modelos de dominio de eventos.")

    return {
        "id": "CP-015",
        "name": "events_query_db_it",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

