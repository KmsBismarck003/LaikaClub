"""
Prueba de Integración de Sistema (SIT) - Comunicación: Cabeceras CORS en Pilgrim Gateway
CP-022: Comprueba la negociación de CORS y respuestas OPTIONS en el punto de entrada.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, FRONTEND_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-022",
        name="gateway_cors_headers_sit",
        module="SIT / CORS e Interoperabilidad Gateway",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la política de Cross-Origin Resource Sharing (CORS) expuesta por Pilgrim Gateway ante peticiones de navegadores.",
        objective="Verificar que el Gateway responda con encabezados Access-Control-Allow-Origin y permita métodos estándar.",
        preconditions="Pilgrim Gateway y frontend accesibles en Azure.",
        test_data=f"Origen: {FRONTEND_URL}, Métodos: OPTIONS y GET"
    )
    doc.start()

    origin_header = {"Origin": FRONTEND_URL}

    # 1. Petición GET normal con cabecera Origin
    resp_get = requests.get(f"{GATEWAY_URL}/api/events/public", headers=origin_header, timeout=10)
    cors_origin_get = resp_get.headers.get("access-control-allow-origin")
    s1_ok = cors_origin_get in {"*", FRONTEND_URL}
    doc.add_step(
        1,
        f"Enviar GET con cabecera Origin: {FRONTEND_URL}",
        "Encabezado access-control-allow-origin presente en la respuesta",
        f"CORS Origin: {cors_origin_get}",
        "✓" if s1_ok else "✗"
    )

    # 2. Petición pre-flight OPTIONS
    options_headers = {
        "Origin": FRONTEND_URL,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
    }
    resp_opt = requests.options(f"{GATEWAY_URL}/api/auth/login", headers=options_headers, timeout=10)
    s2_ok = (resp_opt.status_code in [200, 204])
    doc.add_step(
        2,
        "Enviar pre-flight OPTIONS a /api/auth/login",
        "HTTP 200 o 204 aceptando preflight",
        f"HTTP {resp_opt.status_code}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("cors_headers", {
        "get_headers": dict(resp_get.headers),
        "options_status": resp_opt.status_code,
        "options_headers": dict(resp_opt.headers)
    })
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El API Gateway permite la comunicación segura entre la SPA de React y los microservicios.")

    return {
        "id": "CP-022",
        "name": "gateway_cors_headers_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

