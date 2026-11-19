"""
Prueba de Compatibilidad (CT) - Codificación: Soporte de Caracteres Internacionales UTF-8
CP-052: Evalúa el manejo adecuado de tildes, eñes y caracteres especiales en los payloads JSON.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-052",
        name="compatibilidad_payload_json_encoding_ct",
        module="Compatibilidad / Codificación UTF-8",
        level="CT",
        test_type="Compatibilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la preservación de caracteres hispanos (á, é, í, ó, ú, ñ, ¿, ¡) al transmitir y persistir datos de usuario en la base de datos.",
        objective="Garantizar que no existan problemas de corrupción de codificación (mojibake) en el ciclo de vida de los datos.",
        preconditions="Usuario autenticado con rol usuario.",
        test_data="Nombres: 'Íñigo', Apellido: 'Peña-Muñoz'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    utf8_payload = {
        "first_name": "Íñigo",
        "last_name": "Peña-Muñoz",
        "phone": "5557778888"
    }

    # 1. Enviar payload con caracteres UTF-8
    put_resp = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=utf8_payload, headers=headers, timeout=10)
    s1_ok = (put_resp.status_code == 200)
    doc.add_step(
        1,
        "Actualizar perfil con nombres conteniendo tildes y eñes ('Íñigo', 'Peña-Muñoz')",
        "HTTP 200 OK con payload aceptado",
        f"HTTP {put_resp.status_code}",
        "✓" if s1_ok else "✗"
    )

    # 2. Consultar y verificar integridad de los caracteres retornados
    get_resp = requests.get(f"{GATEWAY_URL}/api/auth/users/me", headers=headers, timeout=10)
    v_data = get_resp.json() if get_resp.status_code == 200 else {}
    s2_ok = (v_data.get("firstName") == "Íñigo" and v_data.get("lastName") == "Peña-Muñoz")
    doc.add_step(
        2,
        "Validar que los caracteres no hayan sufrido corrupción (mojibake)",
        "firstName='Íñigo', lastName='Peña-Muñoz'",
        f"firstName='{v_data.get('firstName')}', lastName='{v_data.get('lastName')}'",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("utf8_verification", v_data)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El pipeline de serialización JSON y MySQL preserva la integridad del juego de caracteres UTF-8.")

    return {
        "id": "CP-052",
        "name": "compatibilidad_payload_json_encoding_ct",
        "level": "CT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

