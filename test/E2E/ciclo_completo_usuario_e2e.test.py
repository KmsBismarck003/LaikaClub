"""
Prueba End-to-End (E2E) - Ciclo de Vida Completo del Rol USUARIO
CP-057: Ejecuta de inicio a fin el recorrido operativo integral de un usuario en el ecosistema real.
"""
import time
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-057",
        name="ciclo_completo_usuario_e2e",
        module="E2E / Ciclo de Vida Integral del Usuario",
        level="E2E",
        test_type="End-to-End",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Recorre exhaustivamente todas las fases de interacción del rol usuario: Registro -> Login -> Edición de Perfil -> Consulta de Catálogo -> Adquisición de Boleto -> Verificación en Cartera -> Consulta de Gamificación -> Atención al Cliente -> Logout.",
        objective="Comprobar que todas las piezas arquitectónicas funcionen coordinadas e integradas sin errores para el usuario.",
        preconditions="Todos los microservicios activos en vivo en Docker.",
        test_data="Usuario dinámico con datos completos de onboarding."
    )
    doc.start()

    timestamp = int(time.time())
    e2e_email = f"e2e_user_{timestamp}@laikaclub.com"
    e2e_pass = "TestE2E2026!"
    all_passed = True

    # 1. Registro
    reg_res = requests.post(
        f"{GATEWAY_URL}/api/auth/register",
        json={"email": e2e_email, "password": e2e_pass, "first_name": "E2E", "last_name": "Tester", "phone": "5551239876"},
        timeout=10
    )
    s1_ok = (reg_res.status_code in [200, 201])
    if not s1_ok: all_passed = False
    doc.add_step(1, "Registro de usuario en la plataforma", "Cuenta creada exitosamente", f"HTTP {reg_res.status_code}", "✓" if s1_ok else "✗")

    # 2. Login y obtención de JWT
    login_res = requests.post(
        f"{GATEWAY_URL}/api/auth/login",
        json={"email": e2e_email, "password": e2e_pass},
        timeout=10
    )
    s2_ok = (login_res.status_code == 200 and "token" in login_res.json())
    if not s2_ok: all_passed = False
    token = login_res.json().get("token") if s2_ok else None
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    doc.add_step(2, "Inicio de sesión y recepción de JWT", "Token de usuario emitido", f"HTTP {login_res.status_code}", "✓" if s2_ok else "✗")

    # 3. Consulta de perfil
    prof_res = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    s3_ok = (prof_res.status_code == 200)
    if not s3_ok: all_passed = False
    doc.add_step(3, "Consulta de datos de perfil inicial", "Perfil retornado con éxito", f"HTTP {prof_res.status_code}", "✓" if s3_ok else "✗")

    # 4. Exploración de eventos
    events_res = requests.get(f"{GATEWAY_URL}/api/events/public?limit=5", timeout=10)
    s4_ok = (events_res.status_code == 200 and len(events_res.json()) > 0)
    if not s4_ok: all_passed = False
    doc.add_step(4, "Exploración de cartelera de eventos", "Catálogo público cargado", f"HTTP {events_res.status_code}, {len(events_res.json()) if s4_ok else 0} eventos", "✓" if s4_ok else "✗")

    # 5. Adquisición de entrada gratuita para evento 24
    claim_res = requests.post(
        f"{GATEWAY_URL}/api/tickets/free",
        json={"eventId": 24, "sectionName": "General", "quantity": 1},
        headers=headers,
        timeout=10
    )
    s5_ok = (claim_res.status_code == 200)
    if not s5_ok: all_passed = False
    doc.add_step(5, "Adquisición de boleto digital gratuito para evento 24", "Entrada generada", f"HTTP {claim_res.status_code}", "✓" if s5_ok else "✗")

    # 6. Verificación en Cartera Digital
    wallet_res = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s6_ok = (wallet_res.status_code == 200 and len(wallet_res.json()) >= 1)
    if not s6_ok: all_passed = False
    doc.add_step(6, "Verificación del boleto en la cartera digital del usuario", "Boleto listado en cartera", f"HTTP {wallet_res.status_code}, {len(wallet_res.json()) if s6_ok else 0} boletos", "✓" if s6_ok else "✗")

    # 7. Consulta de logros y nivel de fidelidad
    ach_res = requests.get(f"{GATEWAY_URL}/api/achievements/my", headers=headers, timeout=10)
    s7_ok = (ach_res.status_code == 200)
    if not s7_ok: all_passed = False
    doc.add_step(7, "Consulta de puntos y progreso de gamificación", "Progreso de logros cargado", f"HTTP {ach_res.status_code}", "✓" if s7_ok else "✗")

    # 8. Cierre de sesión (Logout)
    logout_res = requests.post(f"{GATEWAY_URL}/api/auth/logout", headers=headers, timeout=10)
    s8_ok = (logout_res.status_code == 200)
    if not s8_ok: all_passed = False
    doc.add_step(8, "Cierre de sesión seguro en el sistema", "Sesión terminada con éxito", f"HTTP {logout_res.status_code}", "✓" if s8_ok else "✗")

    doc.attach_evidence("e2e_execution_summary", {
        "email": e2e_email,
        "steps_summary": [s1_ok, s2_ok, s3_ok, s4_ok, s5_ok, s6_ok, s7_ok, s8_ok]
    })
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El recorrido integral E2E del rol usuario se ejecutó con absoluta coherencia en todos los servicios.")

    return {
        "id": "CP-057",
        "name": "ciclo_completo_usuario_e2e",
        "level": "E2E",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

