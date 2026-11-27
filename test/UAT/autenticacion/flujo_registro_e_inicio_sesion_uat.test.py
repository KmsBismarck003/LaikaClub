"""
Prueba de Aceptación de Usuario (UAT) - Autenticación: Flujo Completo Registro e Inicio de Sesión
CP-029: Evalúa la experiencia completa de un nuevo usuario al crear su cuenta e ingresar al sistema.
"""
import time
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-029",
        name="flujo_registro_e_inicio_sesion_uat",
        module="UAT / Onboarding y Autenticación",
        level="UAT",
        test_type="Aceptación de Usuario",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el flujo de aceptación del usuario desde la perspectiva de una persona real que se registra y posteriormente inicia sesión.",
        objective="Garantizar que un nuevo usuario pueda registrarse sin fricción y acceder inmediatamente con sus credenciales.",
        preconditions="Servicios de autenticación y base de datos disponibles.",
        test_data="Usuario dinámico: uat_user_<timestamp>@laikaclub.com, Pass: 'PassUAT2026!'"
    )
    doc.start()

    timestamp = int(time.time())
    uat_email = f"uat_user_{timestamp}@laikaclub.com"
    uat_pass = "PassUAT2026!"

    # Paso 1: Registro de nuevo usuario
    reg_payload = {
        "email": uat_email,
        "password": uat_pass,
        "first_name": "Usuario",
        "last_name": "Aceptación",
        "phone": "5551122334"
    }
    reg_resp = requests.post(f"{GATEWAY_URL}/api/auth/register", json=reg_payload, timeout=10)
    s1_ok = (reg_resp.status_code in [200, 201])
    doc.add_step(
        1,
        "Registrar nuevo usuario mediante formulario de registro",
        "Cuenta creada exitosamente con token o confirmación",
        f"HTTP {reg_resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    # Paso 2: Iniciar sesión con las credenciales recién creadas
    login_payload = {
        "email": uat_email,
        "password": uat_pass
    }
    login_resp = requests.post(f"{GATEWAY_URL}/api/auth/login", json=login_payload, timeout=10)
    s2_ok = (login_resp.status_code == 200)
    login_data = login_resp.json() if s2_ok else {}
    doc.add_step(
        2,
        "Iniciar sesión en el portal con las credenciales registradas",
        "Ingreso concedido y token JWT devuelto",
        f"HTTP {login_resp.status_code}, Token emitido: {'Sí' if 'token' in login_data else 'No'}",
        "✓" if s2_ok else "✗"
    )

    # Paso 3: Verificar identidad y rol asignado
    role = login_data.get("user", {}).get("role")
    s3_ok = (role == "usuario")
    doc.add_step(
        3,
        "Verificar que el rol asignado por defecto sea 'usuario'",
        "Rol = 'usuario'",
        f"Rol obtenido: '{role}'",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("uat_onboarding", {"registered_email": uat_email, "login_status": login_resp.status_code})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El recorrido de bienvenida y acceso satisface los criterios de aceptación del usuario.")

    return {
        "id": "CP-029",
        "name": "flujo_registro_e_inicio_sesion_uat",
        "level": "UAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

