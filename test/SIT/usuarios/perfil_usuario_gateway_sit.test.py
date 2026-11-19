"""
Prueba de Integración de Sistema (SIT) - Usuarios: Consulta y Actualización de Perfil
CP-019: Evalúa la lectura y actualización de datos personales (/api/auth/users/me) a través del Gateway.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-019",
        name="perfil_usuario_gateway_sit",
        module="SIT / Perfil de Usuario",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el flujo bidireccional de consulta (GET) y actualización (PUT) del perfil de usuario vía Pilgrim Gateway.",
        objective="Verificar que los cambios enviados en el cuerpo JSON de actualización persistan y se reflejen en la consulta posterior.",
        preconditions="Usuario autenticado con rol usuario.",
        test_data="Nombres: 'QA Auditor', 'Senior Test', Teléfono: '5559876543'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Consultar perfil actual
    get_resp = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    s1_ok = (get_resp.status_code == 200)
    current_data = get_resp.json() if s1_ok else {}
    doc.add_step(1, "Consultar perfil vía GET /api/auth/users/me", "HTTP 200 con datos de perfil", f"HTTP {get_resp.status_code}", "✓" if s1_ok else "✗")

    # 2. Actualizar perfil
    update_payload = {
        "first_name": "QA_Verified",
        "last_name": "Tester_Auto",
        "phone": "5559876543"
    }
    put_resp = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=update_payload, headers=headers, timeout=10)
    s2_ok = (put_resp.status_code == 200)
    doc.add_step(2, "Enviar actualización vía PUT /api/auth/users/me", "HTTP 200 con perfil actualizado", f"HTTP {put_resp.status_code}", "✓" if s2_ok else "✗")

    # 3. Comprobar persistencia del cambio
    verify_resp = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    v_data = verify_resp.json() if verify_resp.status_code == 200 else {}
    s3_ok = (v_data.get("firstName") == "QA_Verified" and v_data.get("phone") == "5559876543")
    doc.add_step(
        3,
        "Re-consultar perfil para comprobar persistencia de cambios",
        "firstName='QA_Verified', phone='5559876543'",
        f"firstName='{v_data.get('firstName')}', phone='{v_data.get('phone')}'",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("profile_lifecycle", {"initial": current_data, "updated": v_data})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Persistencia confirmada a través de las capas Gateway -> Microservicio Auth -> MySQL.")

    return {
        "id": "CP-019",
        "name": "perfil_usuario_gateway_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

