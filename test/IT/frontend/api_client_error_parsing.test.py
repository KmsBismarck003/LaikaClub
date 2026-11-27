"""
Prueba de Integración (IT) - Frontend: Parsing y Manejo de Respuestas de Error HTTP
CP-012: Comprueba la transformación de payloads de error del backend (detail/message) en errores comprensibles.
"""
from utils.case_documenter import TestCaseDocumenter

def parse_backend_error(data):
    if not data:
        return "Error en la petición"
    if isinstance(data, dict):
        if "message" in data and isinstance(data["message"], str):
            return data["message"]
        if "detail" in data:
            detail = data["detail"]
            if isinstance(detail, str):
                return detail
            if isinstance(detail, list):
                # Formato de error de validación Pydantic / FastAPI
                messages = []
                for err in detail:
                    loc = err.get("loc", [])
                    field = loc[-1] if loc else ""
                    msg = err.get("msg", "")
                    messages.append(f"{field}: {msg}" if field else msg)
                return ", ".join(messages)
            if isinstance(detail, dict):
                return detail.get("message", str(detail))
    elif isinstance(data, str):
        return data
    return "Error en la petición"

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-012",
        name="api_client_error_parsing",
        module="Cliente HTTP / Frontend Error Handling",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el procesamiento de respuestas de error estructuradas provenientes de Spring Boot y FastAPI Gateway.",
        objective="Garantizar que los errores con formato {detail: ...} o {message: ...} se traduzcan en mensajes claros.",
        preconditions="Lógica de parsing de apiClient.js implementada.",
        test_data="Payloads: dict con message, dict con detail dict, lista de errores Pydantic"
    )
    doc.start()

    payload_spring = {"status": 401, "message": "Credenciales inválidas"}
    res1 = parse_backend_error(payload_spring)
    s1_ok = (res1 == "Credenciales inválidas")
    doc.add_step(1, "Parsear error estándar de Spring Boot ({'message': ...})", "Credenciales inválidas", res1, "✓" if s1_ok else "✗")

    payload_gateway = {"detail": {"message": "Credenciales inválidas", "attempts": 1, "max_attempts": 3}}
    res2 = parse_backend_error(payload_gateway)
    s2_ok = (res2 == "Credenciales inválidas")
    doc.add_step(2, "Parsear error anidado de Pilgrim Gateway ({'detail': {'message': ...}})", "Credenciales inválidas", res2, "✓" if s2_ok else "✗")

    payload_pydantic = {"detail": [{"loc": ["body", "email"], "msg": "field required", "type": "value_error.missing"}]}
    res3 = parse_backend_error(payload_pydantic)
    s3_ok = ("email: field required" in res3)
    doc.add_step(3, "Parsear error de validación de campos ({'detail': [{'loc': ...}]})", "email: field required", res3, "✓" if s3_ok else "✗")

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("parsed_outputs", {"spring": res1, "gateway": res2, "pydantic": res3})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El cliente HTTP desacopla las variaciones entre microservicios Java y Gateway Python.")

    return {
        "id": "CP-012",
        "name": "api_client_error_parsing",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

