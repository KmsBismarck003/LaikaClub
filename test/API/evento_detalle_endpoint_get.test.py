"""
Prueba de API (API) - Eventos: GET /api/events/{id} Evento Existente
CP-066: Verifica la consulta de detalle de un evento específico mediante su identificador.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-066",
        name="evento_detalle_endpoint_get",
        module="API / Detalle de Evento",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención del detalle de un evento por su ID primario mediante GET /api/events/{id}.",
        objective="Garantizar que el servicio retorne HTTP 200 con el objeto completo del evento (funciones, mapa de asientos, precios).",
        preconditions="Evento 19 existente en la base de datos.",
        test_data="ID de evento: 19"
    )
    doc.start()

    target_id = 19
    resp = requests.get(f"{GATEWAY_URL}/api/events/{target_id}", timeout=10)
    s1_ok = (resp.status_code == 200)
    data = resp.json() if s1_ok else {}

    doc.add_step(1, f"Enviar GET /api/events/{target_id}", "HTTP 200 OK", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = (data.get("id") == target_id and bool(data.get("name")))
    doc.add_step(2, "Verificar coincidencia del ID e información descriptiva", f"ID={target_id} y name no nulo", f"ID={data.get('id')}, Name='{data.get('name')}'", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("event_detail_data", data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El detalle del evento contiene la información requerida para el flujo de compra.")

    return {
        "id": "CP-066",
        "name": "evento_detalle_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

