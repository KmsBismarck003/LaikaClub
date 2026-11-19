"""
Prueba de Aceptación de Usuario (UAT) - Perfil: Actualización de Datos Personales
CP-030: Comprueba la experiencia de usuario al actualizar su información personal en el perfil.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-030",
        name="actualizacion_datos_personales_uat",
        module="UAT / Gestión de Perfil de Usuario",
        level="UAT",
        test_type="Aceptación de Usuario",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la experiencia del usuario al acceder a 'Mi Perfil' y actualizar sus nombres, apellidos y teléfono de contacto.",
        objective="Garantizar que el formulario de perfil acepte la modificación y notifique el éxito con datos actualizados.",
        preconditions="Usuario autenticado en la plataforma.",
        test_data="Nuevos datos: First='Usuario UAT', Last='Final', Phone='5553334444'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # Paso 1: Acceso a la información actual del perfil
    get_res = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    s1_ok = (get_res.status_code == 200)
    doc.add_step(1, "Acceder a la pantalla de 'Mi Perfil'", "Información de cuenta visualizada", f"HTTP {get_res.status_code}", "✓" if s1_ok else "✗")

    # Paso 2: Guardar cambios en el formulario de perfil
    new_data = {
        "first_name": "Usuario UAT",
        "last_name": "Final",
        "phone": "5553334444"
    }
    put_res = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=new_data, headers=headers, timeout=10)
    s2_ok = (put_res.status_code == 200)
    doc.add_step(2, "Enviar modificaciones en el formulario", "Cambios guardados con éxito", f"HTTP {put_res.status_code}", "✓" if s2_ok else "✗")

    # Paso 3: Confirmar que la vista de perfil refleje los nuevos datos
    ver_res = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    v_body = ver_res.json() if ver_res.status_code == 200 else {}
    s3_ok = (v_body.get("firstName") == "Usuario UAT" and v_body.get("phone") == "5553334444")
    doc.add_step(
        3,
        "Recargar perfil para validar persistencia de los cambios",
        "Datos coincidentes con los ingresados",
        f"Nombre: {v_body.get('firstName')}, Tel: {v_body.get('phone')}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("profile_update_uat", v_body)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El usuario puede gestionar su información personal de manera transparente e inmediata.")

    return {
        "id": "CP-030",
        "name": "actualizacion_datos_personales_uat",
        "level": "UAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

