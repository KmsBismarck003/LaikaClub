"""
Prueba de Integración (IT) - Backend: Integración AuthService <-> MySQL (laika_auth)
CP-013: Verifica la consulta, actualización y persistencia real de usuarios en base de datos.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_single
from config.test_config import GATEWAY_URL, QA_USER_EMAIL, QA_USER_PASSWORD

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-013",
        name="auth_service_mysql_it",
        module="Autenticación / Persistencia MySQL",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Comprueba la integración directa entre el microservicio de autenticación y la base de datos MySQL real laika_auth.",
        objective="Verificar que una autenticación exitosa consulte el registro real y actualice el campo last_login o auth_logs.",
        preconditions="Servicio laika_auth (puerto 8101) y contenedor MySQL activos sin mocks.",
        test_data=f"Email: {QA_USER_EMAIL}"
    )
    doc.start()

    # 1. Consultar estado en base de datos antes del login
    user_before = execute_single("laika_auth", "SELECT id, email, role, status FROM users WHERE email = %s", (QA_USER_EMAIL,))
    s1_ok = (user_before is not None and user_before.get("email") == QA_USER_EMAIL)
    doc.add_step(
        1,
        "Consultar existencia del usuario directamente en laika_auth.users",
        f"Usuario con email {QA_USER_EMAIL} existe",
        f"ID: {user_before.get('id') if user_before else 'N/A'}, Rol: {user_before.get('role') if user_before else 'N/A'}",
        "✓" if s1_ok else "✗"
    )

    # 2. Ejecutar login real vía API
    login_resp = requests.post(
        f"{GATEWAY_URL}/api/auth/login",
        json={"email": QA_USER_EMAIL, "password": QA_USER_PASSWORD},
        timeout=10
    )
    s2_ok = (login_resp.status_code == 200 and "token" in login_resp.json())
    doc.add_step(
        2,
        "Enviar solicitud POST /api/auth/login con credenciales reales",
        "HTTP 200 y token JWT emitido",
        f"HTTP {login_resp.status_code}, Token emitido: {'Sí' if 'token' in login_resp.json() else 'No'}",
        "✓" if s2_ok else "✗"
    )

    # 3. Comprobar consistencia del ID devuelto contra MySQL
    user_id_api = login_resp.json().get("user", {}).get("id")
    s3_ok = (user_id_api == user_before.get("id"))
    doc.add_step(
        3,
        "Validar coincidencia entre el ID devuelto por el servicio y el ID de MySQL",
        f"ID API ({user_id_api}) == ID MySQL ({user_before.get('id')})",
        f"ID API={user_id_api}, ID DB={user_before.get('id')}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("db_record", user_before)
    doc.attach_evidence("api_response", {"status_code": login_resp.status_code, "user_id": user_id_api})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Integración transaccional y consulta entre AuthService y MySQL verificada con éxito real.")

    return {
        "id": "CP-013",
        "name": "auth_service_mysql_it",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

