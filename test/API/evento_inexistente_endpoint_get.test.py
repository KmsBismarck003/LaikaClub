"""
Prueba de API (API) - Eventos: GET /api/events/{id} Evento Inexistente
CP-067: Comprueba la respuesta HTTP 404 ante solicitud de un identificador inexistente.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-067",
        name="evento_inexistente_endpoint_get",
        module="API / Detalle de Evento",
        level="API",
        test_type="Manejo de Errores / Negativo",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el comportamiento del microservicio de eventos ante la solicitud de un ID que no existe en el catálogo.",
        objective="Garantizar que el servicio retorne código HTTP 404 Not Found sin excepciones internas 500.",
        preconditions="Servicio de eventos activo.",
        test_data="ID inexistente: 9999999"
    )
    doc.start()

    fake_id = 9999999
    resp = requests.get(f"{GATEWAY_URL}/api/events/{fake_id}", timeout=10)
    s1_ok = (resp.status_code == 404)

    doc.add_step(
        1,
        f"Enviar GET /api/events/{fake_id} con ID no registrado",
        "HTTP 404 Not Found",
        f"HTTP {resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("not_found_response", {"status_code": resp.status_code, "text": resp.text[:150]})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El servicio maneja con propiedad las referencias a recursos no encontrados.")

    return {
        "id": "CP-067",
        "name": "evento_inexistente_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

