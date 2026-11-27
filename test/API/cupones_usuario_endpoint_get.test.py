"""
Prueba de API (API) - Gamificación: GET /api/achievements/coupons
CP-073: Evalúa la consulta de cupones de fidelización asignados al usuario actual.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-073",
        name="cupones_usuario_endpoint_get",
        module="API / Gamificación y Cupones",
        level="API",
        test_type="Funcional",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la obtención de cupones de descuento vigentes y aplicables para el usuario mediante GET /api/achievements/coupons.",
        objective="Verificar que el microservicio responda con código HTTP 200 y una lista con los cupones activos del usuario.",
        preconditions="Usuario autenticado.",
        test_data="Token JWT del usuario de prueba"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    resp = requests.get(f"{GATEWAY_URL}/api/achievements/coupons", headers=headers, timeout=10)
    s1_ok = (resp.status_code == 200)
    coupons = resp.json() if s1_ok else []

    doc.add_step(1, "Enviar GET /api/achievements/coupons con Bearer token", "HTTP 200 OK con lista JSON", f"HTTP {resp.status_code}", "✓" if s1_ok else "✗")

    s2_ok = isinstance(coupons, list)
    doc.add_step(2, "Verificar lista de cupones asignados", "Estructura de lista JSON", f"{len(coupons)} cupones activos devueltos", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("user_coupons_response", {"count": len(coupons), "coupons": coupons[:3]})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El motor de recompensas evalúa y entrega los cupones vigentes.")

    return {
        "id": "CP-073",
        "name": "cupones_usuario_endpoint_get",
        "level": "API",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

